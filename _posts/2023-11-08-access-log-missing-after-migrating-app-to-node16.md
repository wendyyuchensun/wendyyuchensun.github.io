---
title: Access Log Missing After Migrating App to Node16
---

Web apps usually have access logs.
Access log is important for traffic monitoring and debugging.
It would be painful to operate a web app if there is no access log, or the information in it is misleading.

One of the app I maintain stopped to produce valid access log after migrating the app to Node16.
It made trouble-shooting hard during incidents.
Thus my team spent some time to solve the issue.

### Symptoms

The first thing we noticed was that the issue only happened in Node16 environment.
It worked fine when we rolled back the app to Node14.

There were many differences between the logs we got between Node16/14.
However, since all of them have same rootcause, let me just mention the most obvious one:
A successful request usually logs response status code 200, which is the case for our app in Node14.
But for Node16 environment, all requests logged status code 0, no matter the server responded successfully or not.

### Take a Close Look at How Access Log Works in My App

It might be funny, but it was the first time we tried to understand how access log works in our app.
In a nutshell, the dependency we used to produce access log hooks to various Nodejs http events/methods to capture request/response information.
For example, it captures status code after `res.writeHead` invokes.

{% highlight js linenos %}
// pseudocode

function onWriteHead(code) {
    log.status = code;
}

// You won't find 'writeHead' event in Nodejs.
// The dependency we use has its own way to hook to Nodejs http methods.
// I omit those details for simplicity.
res.on('writeHead', onWriteHead);
{% endhighlight %}

The dependency also includes a default log object at the beginning, and a method to finish logging in the end.
So the full code (again greatly simplified) actually looks like this:

{% highlight js linenos %}
// pseudocode

const log = {
    status: 0
};

function onWriteHead(code) {
    log.status = code;
}

function finishLog() {
    console.log(log);
}

res.on('writeHead', onWriteHead);
res.once('close', finishLog);

// in case request incomplete?
req.once('close', finishLog);
req.once('error', finishLog);
{% endhighlight %}

The default `status: 0` caught our attention.
Would it be something wrong with the above logic, so the dependency accidentally printed the default log object in Node16?

### Experiment

{% highlight js linenos %}
// index.js, pseudocode
const http = require('http');

const requestListener = function (req, res) {
    res.on('writeHead', () => console.log('res.writeHead'));
    res.once('close', () => console.log('res.close'));
    req.once('close', () => console.log('req.close'));
    // skip req error case

    req.on('data', () => {});
    setImmediate(() => res.end());
}

const server = http.createServer(requestListener);
server.listen(8080);
{% endhighlight %}

{% highlight console %}
wendy@mac % node -v
v14.21.3

wendy@mac % node index.js (then curl http://localhost:8080 in another terminal window)
res.writeHead
req.close
res.close
{% endhighlight %}

{% highlight console %}
wendy@mac % node -v
v16.20.1

wendy@mac % node index.js (then curl http://localhost:8080 in another terminal window)
req.close
res.writeHead
res.close
{% endhighlight %}

Voilà!

In Node16, request close event happens earlier then the other 2 response events.
So the dependency will call `finishLog` before `onWriteHead`, printing log before it collect status information.

### Result

After some research, I think it's the same thing mentioned in this [Nodejs issue](https://github.com/nodejs/node/issues/38924).
In Node16, `req.on('close')` refers to stream close, different compared with Node14 which is socket close.
It was a breaking change not [documented](https://nodejs.org/docs/latest-v16.x/api/http.html#event-close_3) very well.
Seems a fair number of other OSS projects got broken by this change too.

In the end, the dependency we use removed the `req.close` part to fix the issue.

### Disclaimer

This is a very simplified story compared with what really happened. And I'm pretty sure the pseudocode won't work if you run it, since I intentionally omit a lot of information about the dependency. The pseudocode is just for demonstrating the issue.

### Reference

- [Undocumented breaking change on v16.0.0](https://github.com/nodejs/node/issues/38924)
- [HTTP - Node.js v16.20.2 Documentation](https://nodejs.org/docs/latest-v16.x/api/http.html#event-close_3)

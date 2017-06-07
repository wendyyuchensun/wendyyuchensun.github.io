---
title: 時序之一：Callback 和 Promise
categories: JS
keywords: callback, Promise
---
時間這個議題也費了我好大一番功夫，大概是實戰經驗還不夠，所以體會不夠深，只能寫一篇詞窮、只能給自己看的筆記。真希望能夠全心全意寫
code 的時日早點到來。

### Callback 的問題

我們很常使用 callback 來安排程式進行的時序，但 callback 卻有 inversion of
control 的問題，以致於我們很難確定 callback 什麼時候會 fire 或 invoke、會獲得什麼樣的結果、該如何處理結果。

沒辦法架構程式進行的時序，也就失去控制程式的能力。這是個麻煩的問題，我們得
normalize time。

### Promise

Promise 是未來值的代表，可以處於 fulfil, reject 或兩者皆非的 pending 的狀態 (status)。Pending 可能會轉成 fulfil 或 reject 兩者之一。如果 fulfil
了，會產生一個 fulfil 的值；如果 reject 了，則會有一個 reject 的
reason。Fulfil 的值或 reject 的 reason 最終會成為整個 Promise 的 value。

`Promise.then(onFulfilled, onRejected)` 則提供了如何處理 fulfil value 或 reject
reason 的方式。`onFulfil` 和 `onReject` 函式，一定會在前接的 Promise 最終值產生（也就是，status 一定是 fulfil 或 reject）後，在未來的 event loop 裡被執行，所以可確保時序上的前後順序，改善了前述 callback 在執行時序上的不穩定性。

另外，因為可以在 `Promise` 裡設定如何、何時 fulfil 與 reject，以及可以在 `then` 裡設定怎麼使用 value 或 reason，這樣的能力也大大增加我們對於未來事件或未來值的操縱空間，kind of like take back control。

### How to Use Promise

#### Promise Object

`Promise` 物件有一個 status property 和一個 value property[（註1）][f1]，status 會註明目前
Promise 所處的 status 狀態，value 則是當前 Promise 的值。

A case of resolved Promise:

```js
const p1 = new Promise((res, rej) => {
  setTimeout(() => res(1), 5000);
});

// Immediately
p1; // status: pending, value: undefined 

// 1 sec later
p1; // status: resolved, value: 1
```

A case of rejected Promise:

```js
const p2 = new Promise((res, rej) => {
  setTimeout(() => rej(1), 5000);
});

// Immediately
p2; // status: pending, value: undefined 

// 1 sec later
p2; // status: rejected, value: 1
```

#### Promise.then(onFulfilled, onRejected)

`.then` 則標記了一個 Promise resolve 或 reject 之後，如何在未來的 event loop 裡處理 Promise 的值。`.then` 執行的結果也會回傳一個 Promise，所以多個 `.then` 可以串接在一起。

```js
const p1 = new Promise(res => res(1))
             .then(v => v + 1);
p1; // {status: resolved, value: 2}

const p2 = p1.then(v => v + 1);
p2; // {status: resolved, value: 3}
```

將一個不知道是同步還是異步處理的 API 包裝成 Promise，再將 callback 放入 Promise 後面接的 `.then()`，也是用來確保 callback 執行時序的好方法。

#### Promise.resolve(), Promise.reject()

如果要立即生成一個 status 是 resolved 或 rejected 的
Promise，可以省略前面製造新 Promise 物件的過程，改用 `Promise.resolve()` 和
`Promise.reject()`。

#### Promise.catch()

如果不在意究竟一個 Promise 後續 pipe 處理的結果是在哪一處發生，可以省略 `.then()` 的 `onRejected` 函式，直接在整個 Promise 鍊的最後加上 
`.catch(onRejected)`，這樣會捉住在這條鏈的任何一處發生的
rejection（若有，總共會發生一次）。

#### Promise.all(), Promise.race()

一次處理多個未來會產生的值，若要全部都產生了再用 `.then()`
進行下一步處理，可以用 `Promise.all(iterable)`；若只要最早產生的值，可以用
`Promise.race(iterable)`。

### 判斷流向

花了好久在 Chrome DevTool 上，好不容易 try out 出究竟整個 Promise chain
在哪個點（或是最終）會是 resolve 還是 reject。

我個人認為是將每個 returned 的 Promise 寫出來，會最好判斷究竟整個 pipe
的過程長怎麼樣。

Case1:

```js
const p = new Promise(res => res(42)).then(v => v + 1, e => e + 1);

// {status: resolved, value: 42}.then(v => v + 1, e => e + 1);
//              |_______________________|

// RESULT: {status: resolved, value: 43}
```

Case2:

```js
const p = Promise.resolve(42).then(v => new Error(v), e => e).then(v => v + 1, e => e);

// {status: resolved, value: 42}.then(v => new Error(v), e => e).then(v => v + 1, e => e);
//              |_____________________________|

// {status: resolved, value: Error 42}.then(v => v + 1, e => e);
//              |_____________________________|

// RESULT: {status: resolved, value: Error 421}  
```

Case3:

```js
const p = Promise.resolve(42).then(v => {throw new Error(v)}).then(v => v, e => e);

// {status: resolved, value: 42}.then(v => {throw new Error(v).then(v => v, e => e)});
//           |______________________________|

// {status: rejected, value: Error 42}.then(v => v, e => e);
//             |______________________________________|

// RESULT: {status: resolved, value: Error 42}
```

Case4:

```js
const p = Promise.reject('error').then().then(null, e => e + 1).catch(e => e);

// {status: rejected, value: 'error'}.then().then(null, e => e + 1).catch(e => e);
//             |____________________________________________|

// {status: resolved, value: 'error1'}.catch(e => e);

// RESULT: {status: resolved, value: 'error1'}
```

Case5:

```js
const p = Promise.resolve(42).then(v => {throw new Error(v + 1)}).then(v => v).catch(e => e);

// {status: resolved, value: 42}.then(v => {throw new Error(v + 1)}).then(v => v).catch(e => e);
//         |___________________________________|

// {status: rejected, value: Error 43}.then(v => v).catch(e => e);
//         |_______________________________________________|

// RESULT: {status: resolved, value: Error 43}
```

Case6:

```js
const p = Promise.resolve(42).then(v => new Promise((res, rej) => rej(v + 1))).then(v => v);

// {status: resolved, value: 42}.then(v => new Prmoise((res, rej) => rej(v + 1))).then(v => v);
//            |________________________________|

// RESULT: {result: rejected, value: 43}
```

### Reference

* Kyle Simpson: ["Syncing Async" (OSCON 2014)][1]
* Kyle Simpson: ["You don't know JS: Async and Performance"][5]
* ["Promises/A+"][2] Specification
* MDN: ["Using Promises"][3] & ["Promise"][4]
* Jake Archibald: ["JavaScript Promises: an Introduction"][6]
* Matt Greer: ["JavaScript Promises ... In Wicked Detail"][7]
* Nolan Lawson: ["We have a problem with promises"][8]

### Footnotes

在瀏覽器的實踐裡，這兩個 property 並不一定真的叫做 status
  跟 value，也不一定可以進用。我還沒讀 ES6 的 Spec，不太確定 Spec
是怎麼規定的，但可以看到 Chrome v58.0.3029.110 的 DevTool 顯示是這樣：

![Promise properties][img1]

[1]:https://www.youtube.com/watch?v=wupXZp5khng
[2]:https://Promisesaplus.com/
[3]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_Promises
[4]:https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise
[5]:https://github.com/getify/You-Dont-Know-JS/tree/master/async%20%26%20performance
[6]:https://developers.google.com/web/fundamentals/getting-started/primers/promises
[7]:http://www.mattgreer.org/articles/promises-in-wicked-detail/#further-reading
[8]:https://pouchdb.com/2015/05/18/we-have-a-problem-with-promises.html

[f1]:#footnotes
[img1]:{{ site.url }}/assets/promise-props.jpg

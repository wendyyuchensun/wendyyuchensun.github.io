---
title: Curious Case of Coverage Lost After Upgrading Project Dependencies
---

最近同事遭遇一起有趣的案件：一個陳舊的 JavaScript 專案，原本測試覆蓋率有 80%，
但在升級套件後，雖然原始碼一行未改，但是測試結果覆蓋率陡降成 30%。
因為 CI/CD 設定部署需通過測試覆蓋率 80% 的門檻，雖然可以調降，但還是需要找出起因。 

### 最小可重現範例

{% highlight shell %}
$ git clone git@github.com:wendyyuchensun/coverage-lost.git && cd coverage-lost
$ git checkout origin && npm install --no-audit && npm run test
{% endhighlight %}

此時您會只有對 `hi.js` 進行測試，而測試報告也僅包含 `hi.js`。

{% highlight console %}
  hello
    - should return hello

  hi
    ✓ should return hi (61ms)

  1 passing (73ms)
  1 pending

----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |      100 |      100 |      100 |      100 |                   |
 hi.js    |      100 |      100 |      100 |      100 |                   |
----------|----------|----------|----------|----------|-------------------|
{% endhighlight %}

接下來將專案切換到已升級套件的版本：

{% highlight shell %}
$ git checkout master && npm install --no-audit && npm run test
{% endhighlight %}

會看見測試報告出現如下變化：

{% highlight console %}
  hello
    - should return hello

  hi
    ✓ should return hi


  1 passing (16ms)
  1 pending

----------|----------|----------|----------|----------|-------------------|
File      |  % Stmts | % Branch |  % Funcs |  % Lines | Uncovered Line #s |
----------|----------|----------|----------|----------|-------------------|
All files |    35.37 |      100 |     3.57 |    50.91 |                   |
 hello.js |    33.75 |      100 |        0 |       50 |... 51,52,53,54,56 |
 hi.js    |      100 |      100 |      100 |      100 |                   |
----------|----------|----------|----------|----------|-------------------|
{% endhighlight %}

縱使實際跳過了 `hello.js` 的測試， 但卻出現了 `hello.js` 的測試報告，
拖累將整體測試覆蓋率。

### 起因

測試覆蓋率工具 `istanbul` 目前計算 coverage 的實作，
是 monkey patch 到 node 的 `require.extension` hook，
所以初步懷疑是新的套件組合導致 `hello.js` 在並未跑測試的情況下，
仍被 `require` 到。

檢查 `babel` 相關的套件，
的確發現 `preset-import` 在升級前後，的確所使用 transpile import to require 的插件不同，
分別是 `babel-plugin-transform-inline-imports-commonjs` 與 `@babel/plugin-transform-modules-commonjs`。

在專案的 master 與 origin 兩個 branch 分別下 `npm run build` 指令，
並觀察兩者透過 babel transpile 出來的 `hello.test.js` 程式碼，
可以看到 origin 的 requier 是 lazy-loaded，意即沒有運行測試的話，並不會計算覆蓋率；
而新的套件組合並未 lazy-load (local) modules，所以變計入覆蓋率了。

{% highlight js linenos %}
// origin

var _hello;

function _load_hello() {
    return _hello = _interopRequireDefault(require('../src/hello'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('hello', () => {
    xit('should return hello', () => {
        (0, (_chai || _load_chai()).expect)((0, (_hello || _load_hello()).default)()).to.equal('hello');
    });
});
{% endhighlight %}

{% highlight js linenos %}
// master (new)

var _hello = _interopRequireDefault(require("../src/hello"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('hello', () => {
  xit('should return hello', () => {
    (0, _chai.expect)((0, _hello.default)()).to.equal('hello');
  });
});
{% endhighlight %}

### 參考資料

- [istanbul hookRequire](https://github.com/istanbuljs/istanbuljs/blob/master/packages/istanbul-lib-hook/lib/hook.js#L87)
- [node require.extensions](https://nodejs.org/api/modules.html#modules_require_extensions)
- [Rethinking JavaScript Test Coverage](https://medium.com/the-node-js-collection/rethinking-javascript-test-coverage-5726fb272949)
- [JavaScript code coverage](https://v8.dev/blog/javascript-code-coverage)
- [Breakdown of How Require Extensions Work](https://gist.github.com/jamestalmage/df922691475cff66c7e6)
- [babel-plugin-transform-inline-imports-commonjs](https://www.npmjs.com/package/babel-plugin-transform-inline-imports-commonjs), [@babel/plugin-transform-modules-commonjs](https://babeljs.io/docs/en/babel-plugin-transform-modules-commonjs)

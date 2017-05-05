---
title: Invocation Context
categories: JS
---
上一篇<a href="https://goo.gl/2HTwa5">文章</a>提到 scope 和 context 是兩個不同的概念。Context 是指函式被呼叫、運行時，擁有該函式的物件，即為 `this` 這個關鍵字所指涉的物件，所以 `this` 在多數的情況下與呼叫函式的方式有關。ES6 的 lexical context 則對此一特性所衍生的問題做了些改良。

### In Global Context

在瀏覽器裡，global scope 以內、任何函式以外，`this` 指涉的都是 global object。以下直到 Lexical Context 以前的小節，都是討論不同呼叫函式的方式如何改變 `this` 所指涉之物。

### Function Invocation

在 sloppy mode 以下直接呼叫函式，`this` 會是 global object；在 strict mode 的情況下，如果程式設計師沒有定義呼叫的 context，`this` 所代表的值是 `undefined`。

```js
// sloppy mode
function myFunc () {
  return this; // what is "this" is not decided yet
};

// we will see what is "this" when we invoke myFunc
myFunc() === window; // true    
```

```js
// strict mode
function myFunc () {
  "use strict";
  return this;
};

myFunc() === window; // false
myFunc() === undefined; // true
```

### Method Invocation

這裡的判斷十分直覺，如果是以一個物件的 method 形式來呼叫函式的話，函式裡的 `this` 指的就是這個擁有正被呼叫 method 的物件。

```js
const obj = {
  myMethod () {
    return this
  }
};

obj.myMethod() === obj; // true
```

### Constructor Invocation

如果 `this` 出現在一個以 constructor 的角色被呼叫的函式裡，則 `this` 指的是透過
`new` 這個 constructor 所新生的物件。

### Self-Defined Context

一般來說，`this`
的值是給定、唯讀的，不容許程式設計師設定；但是有時需要保留或是指定特定的 context
的時候，可以使用 `call`、`apply` 或 `bind` 的方式來指定呼叫函式時的
context。這三者都是每個 JS 函式物件都會從 `Function.prototype` 處繼承來的內建 method。

`call` 跟 `apply` 比較相似。當一個函式使用兩者之一，並傳入一個物件作為第一個參數，`call` 或 `apply` 會回傳以該參數為
context 呼叫此一函式的結果；也就是類似於幫參數物件新增一個以該函式為內容的 method，並呼叫這個 method 所產生的效果。

```js
function add (c, d) {
  // We don't know what is 'this' when we define add,
  // but that's totally fine.
  return this.a + this.b + c + d; 
};

const obj = {a: 1, b: 2};

// Now we know what is "this".
// It's the first parameter passed into call/apply.
add.call(obj, 3, 4); // 10;
add.apply(obj, [3, 4]); // 10
```

`bind` 與前面兩者不一樣的地方在於，`bind` 會回傳一個以目前函數與
scope 為基礎、但以第一個參數為 context 的新函式。

```js
function f () {
  return this.a;
};

const g = f.bind({a: 1});
g(); // 1
```

### Lexical Context

使用 `=>` 定義的函式 expression，所使用到的 `this` 在呼叫這個函式時，都會被指定爲該函式在定義時往上最接近 scope 的 `this`。就算是將這個 `=>` 所定義的函式傳出另存成一個變數再進行呼叫，或是同時嘗試使用 `call`、`apply` 或 `bind` 來重設 context， 也不會改變。

```js
// Assuming in browser
const obj = {
  myNum: 1,
  myFunc () {
    return () => this.myNum;  
  }
};

const func1 = obj.myFunc(); // this in closest scope is obj
func1(); // 1, not undefined

const func2 = obj.myFunc; // this is closest scope is window 
func2()(); // undefined, not 1
```

### DOM Event Handler

當某一個函式被當作 event handler 這種 callback，若這個函式裡有使用到 `this` 關鍵字，則
`this` 是觸發這個 callback 的 DOM 物件。

```js
function myFunc () {
  return this;
};

const btn = document.getElementById("btn");
btn.onclick = myFunc;

btn.onclick() === btn; // true
```

### Issues

最後這個小節討論幾個不容易判斷
context、容易混淆的狀況，或是希望保存、指定 context 的作法。我總覺得前面幾個規則乍看下很好判斷，但到了實際看到稍複雜的案例時總會令人騷破頭皮。

#### Case1

首先，把某個使用到 `this` 的物件
method，傳出來儲存在一個變數，如果我們用這個新的變數來呼叫 method，`this`
會是原本定義時的物件嗎？

```js
const obj = {
  person: "Wendy",
  sayHi () {
    console.log(this.person + " says hi.");
  }
};

obj.sayHi(); // logs "Wendy says hi."

const greeting = obj.sayHi;
greeting(); // logs "undefined says hi.", not "Wendy says hi.";
```

最後一行程式碼的結果結果不如我們的預期，為什麼呢？因為以函式形式呼叫的函式，在
sloppy mode 下所使用到的 `this` 指的是 global object，又此時 global object
並沒有 `person` 這個 property，所以會回傳 `undefined`。

如果我們希望能夠在呼叫 `greeting` 這個函式時，還是能夠回傳出跟我們直接呼叫
`obj.saysHi` 一樣的結果，就得想個方法把 context  設定成 `obj`
這個物件，才能在呼叫 `greeting` 函式時得到正確的 `this`。我們可以用
`bind`：

```js
const greeting = obj.sayHi.bind(obj);
greeting(); // "Wendy says hi."
```

這裡有一個需要留心的地方：當我們把 method 傳出來儲存在變數裡時，是要傳出
method 的 expression 而非直接呼叫這個 method，否則 method
會直接以原本所屬的物件為 context 執行並回傳結果了。

#### Case2

接下來看一個在 ES6 出現以前的經典問題：

```js
const obj = {
  person: "Wendy",
  sayHi () {
    const addFamilyName = function() {
      return this.person + " Sun";
    };
    console.log(addFamilyName() + " says hi.");
  }
};

obj.sayHi(); // logs "undefined Sun says hi.", not what we expected.
```

奇怪，結果竟然不是 `"Wendy Sun says hi."`，可是 `this` 明明是用在一個以 object
method 形式來呼叫的函式裡，為什麼沒有指向 `obj` 呢？

原因出在我們的 `this` 指向所屬物件的範圍，只有 method 的第一層，如果 method
裡還存在其他 closure，那麼在這些 closure 所組成的 local scope 裡，`this` 將會被重新指定，變成和所有以函式形式呼叫一個函式的 `this` 一樣，都是 global object。

如果我們希望 method 下的 local scope 裡，`this` 還是可以指向 method 所屬的物件，該怎麼做呢？在 ES6 的新語法出現以前，有一個經典的解法，也就是將 `this` 保存在一個變數裡，方便未來可以繼續引用，如同以下程式碼的第 4 行：

```js
const obj = {
  person: "Wendy",
  sayHi () {
    const that = this;  // classic work-around trick
    const addFamilyName = function () {
      return that.person + " Sun";
    };
    console.log(addFamilyName() + " says hi.");
  }
};

obj.sayHi(); // "Wendy Sun says hi." Yeh!
```

我個人認為這是蠻聰明的作法，也就是體認到雖然 `this`
這個 keyword 的內容會隨函式的呼叫而改變，但是每個時刻 `this`
背後所指向的東西卻是可以透過一個固定變數引用的物件。

在 ES6 以後，我們可以省下宣告、定義變數以保存 `this` 的麻煩，直接使用 lexical
conext 來解決這個問題：

```js
const obj = {
  person: "Wendy",
  sayHi () {
    const addFamilyName = () => {
      return this.person + " Sun";
    };
    console.log(addFamilyName() + " says hi.");
  }
};
``` 

因為 lexical context 會將 `this` 指定為往上最接近的 execute context 的 `this`，所以有保存 `this` 的效果。 

#### Case3

最後，看一個不同物件間互相借用 method 的狀況：如果一個物件向另一個物件借用
method，而這個被借用的 method 有用到 `this`，那麼究竟此時 `this`
指的是借方還是出借方呢？

```js
const obj1 = {
  nums: [1, 2, 3, 4],
  length: this.nums.length,
  avgNum: null,
  avg () {
    return this.nums.reduce((a, n) => a += n) / this.length;
  }
};
 
var obj2 = {
  nums: [5, 6, 7]
};

obj2.avgNum = obj1.avg(); // 2.5 (average of obj1.nums) 
```

當我們以 method 的形式呼叫函式時，`this`
會被指定為使用 method 的物件，所以在上方的程式碼最後一行裡的 `this` 是 `obj1`，呼叫函式所得到的結果當然是 `obj1`
的平均數，而非 `obj2` 的了。

如果希望 `obj2` 可以使用 `obj1` 的 method，卻又不希望替 `obj2` 新增一個
內容完全一模一樣的 method，好重複利用程式碼、省下重複定義的功夫，可以在呼叫借來的 method 時，利用 `call` 或 `apply` 把 context
設定成 `obj2`：

```js
obj2.avgNum = obj1.avg.call(obj2); // 6
```

### References

* MDN: ["`this`"][1]
* Ryan Morr: ["Understanding Scope and Context in JavaScript"][2]
* Stack Overflow: ["How to access the correct `this` inside a callback?"][3]
* JavaScript.isSexy: ["Understand JavaScript’s `this` With Clarity, and Master It"][8]
* Douglas Crockford: ["JavaScript - the Good Parts"][JSGP]

[1]:https://goo.gl/4xO8de
[2]:https://goo.gl/Myy0Bb
[3]:https://goo.gl/nu7w0N
[8]:https://goo.gl/QcePeq
[JSGP]:http://shop.oreilly.com/product/9780596517748.do

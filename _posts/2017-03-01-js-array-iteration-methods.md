---
title: 迭代 JavaScript 陣列元素的方法
description: ES5 提供了幾個可以簡化以 for 迴圈迭代陣列的新方法！
categories: JS
---
我從 Free Code Camp 學到以 `reduce` 取代 `for` 迴圈，以迭代陣列的元素。後來查了 Flanagan 的JavaScript 大全一書，發現還有其他類似的方法，如 `forEach`、`map`、`filter`。本文就是此番查找後，用自己的語言重新述說一遍結果的產物。

### 舊方法

在讀到 Free Code Camp 的文章前，我主要是用迴圈製造出目標陣列所有元素的索引，再藉由索引進用並加以操縱陣列的每個元素。舉例來說，我用一個陣列紀錄一名學生在一次段考中五個科目的成績，並利用 `for` 迴圈取得總成績：

```js
const scores = [51, 98, 73, 66, 71];
let sum = 0;
const numOfSbjs = scores.length;
for (let i = 0; i != numOfSbjs; i++) {
  sum += scores[i];
};

sum;  // 369
```

### 新方法

隨著 JavaScript 版本的衍進，ES5 提供了幾個可以大大簡化上述利用迴圈迭代陣列元素的陣列方法。Flanagan 在 JavaScript 大全裡淺析了這些方法的共通點：

* 這些方法的第一個參數是函式，又可稱為 callback，將在用在尋訪每一個元素時作用在元素上，不存在的元素則不會觸動 callback。
* callback 通常 (但非全部都只) 有三個參數：執行當下所用的陣列元素、該元素在陣列中的索引，以及陣列本身。
* callback 通常只需要宣告第一個參數。
* callback 的回傳 (return) 值很重要，但不同方法處理回傳值的方式也不同，所以如何設定回傳的值同時取決於方法本身與 callback 的設計。
* 這些方法不會直接修改陣列本身，除非所使用的 callback 有此一作用。
  

以下就進入這些方法的詳細介紹囉。

### forEach

`forEach` 的 callback 如同前述，接受三個參數，且後二個可以省略。這個方法沒有預設回傳內容。


舉例來說，若改寫前述的求總分案例，就可以省略後二個參數，且簡化了原本用迴圈時需要先找出陣列長度以製造索引的麻煩：


```js
// callback 省略後二個參數

const scores = [51, 98, 73, 66, 71];
let sum = 0;
scores.forEach(score => {// score 是第一個參數，代表每次被尋訪的元素
 sum += score;
});

sum;  // 369
```

現在，老師大發慈悲，學生每科成績可以加 5 分，最多加到 100 分，所以得更新學生的成績陣列，此時就可以利用上一個例子沒有用到的另外兩個參數：


```js
// callback 使用三個參數
  
let scores = [51, 98, 73, 66, 71];
scores.forEach((score, index, array) => {
 array[index] = (score + 5) > 100? 100: (score + 5);
});

scores; // [56, 100, 78, 71, 76]
```

### map


`map` 讓我想到國中時學的地圖投影，假設原始的陣列是地球，而傳入的 callback 是自球體中間發出的投影光線，那產生的新陣列就是投影的結果，即一張可以與圓球體對應的平面地圖。

這樣說起來，`map` 與 `forEach` 很像，一樣是迭代陣列的所有元素，並在元素上套用 callback，兩者的差異在哪裡呢？答案是：提供給 `map` 的 callback 一定要設定回傳值，也就是操縱每個單一元素的結果，而整體回傳的結果會是一個新的陣列，長度與原陣列相同，且因為不存在的元素不會觸動 callback，所以所產生的新陣列中，這些原陣列空窗的位置，在新陣列裡也會是空窗、不存在的元素。

如果我們再一次改寫上一個加分的案例，這一次不直接修改原始分數，而是將新的分數存成另一個陣列：

```js
const scores = [51, 98, 73, 66, 71];
const newScores = scores.map(score => {
 return (score + 5) > 100? 100: (score + 5);
});

newScores;  // [56, 100, 78, 71, 76]
```

### filter

顧名思義，`filter` 就是過濾出原始陣列裡符合條件的元素。與 `map` 一樣的地方是 callback 需要設定回傳條件，而整個 `filter` 回傳的值是一個包含所有符合條件元素的新陣列。

但與 `map` 不一樣的地方是，既然是過濾，那麼可能會有部分元素無法通過 callback 所設定的條件，以至於最終所產生的新陣列的長度不一定與原始陣列一樣，而且新陣列不會有空隙。

舉例來說，如果我們想要得知上一個例子裡的學生，五科成績中有哪些通過 60 分及格標準：

```js
const pass = newScores.filter(score => {
 return score >= 60;
});

pass; // [100, 78, 71, 76]
```

### reduce

`reduce` 最特別。它的作用是將原始陣列裡的所有元素透過 callback 濃縮成一個結果。為了達到這樣的結果，`reduce` 在參數設計上跟前面幾個方法不太一樣，

以 `reduce` 本身而言，這個方法接受兩個參數，第一個是 callback，第二個是「起始值」，也就是濃縮的基底或起點，是個可有可無的參數。

以傳入 callback 而言，跟 `map`、`filter` 不一樣的地方在於所使用的參數有四個，除了熟悉的執行當下所用的陣列元素、該元素在陣列中的索引，以及陣列本身作為第二、第三、第四參數外，第一個參數則是「callback 執行當下，所有先前 callback 的結果」。如果 `reduce` 本身缺少第二個作為起始值的參數，那麼當第一次執行 callback 時，陣列的第一與第二個元素則會作為 callback 的第一、第二個參數，也就是說第一個元素會作為起始值。

callback 回傳的內容即為希望如何操弄元素與結果之間的關係。

例如求分數平均值：

```js
// 不需設定起始值 (即不提供 reduce 的第二個參數)
  
const scores = [51, 98, 73, 66, 71];
const average = scores.reduce((acc, score, indx, arr) => {
 acc += score;
 if (indx == arr.length - 1) {
     return acc / arr.length;
 } else {
     return acc;
 };
});
  
average;  // 71.8
```

至於需要設定起始值參數的案例，可以參考以下 <a href="#flatten">`flatten` 段落</a>。

### What Can We Do with These Methods

<p id="flatten">把多維陣列變成一維陣列，元素順序不變，即 flatten an
array：</p>

```js
// 用 for 迴圈

var flatten = function(arr) {
 var newArr = [];
 for (var i = 0; i < arr.length; i++) { // 記得歸零每個迴圈 i 的起始值
     if (Array.isArray(arr[i])) {
         newArr = newArr.concat(flatten(arr[i]));
     } else {
         newArr = newArr.concat(arr[i]);
     };
 };
 return (newArr);
};

flatten([1, [2, 3], [4, [5, 6]]]);  // [1, 2, 3, 4, 5, 6]
```

```js
// 用 reduce

function flatten(arr) {
 return arr.reduce((acc, val) => {
     if (Array.isArray(val)) {
         acc = acc.concat(flatten(val));
     } else {
         acc.push(val);
     };
     return acc;
 }, []);  // 無法預知第一個元素是否為陣列，所以直接設定起始值為一空陣列
};

flatten([1, [2, 3], [4, [5, 6]]]);  // [1, 2, 3, 4, 5, 6]
```

製作計分板 (tally)，例如統計一個陣列裡每種字母出現的次數：

```js
function tally(arr) {
 return arr.reduce((acc, character) => {
     if (character in acc) {
         acc[character]++;
     } else {
         acc[character] = 1;
     };
     return acc;
 }, {});
};

tally(["b", "o", "a", "t", "a"]); // {"b": 1, "o": 1, "a": 2, "t": 1}
```

安排管線 (pipeline)：

```js
function ddv2(val) {return val / 2};
function mul2(val) {return val * 2};
function add1(val) {return val + 1};
function minus1(val) {return val - 1};

let pipeline = [add1, add1, minus1, ddv2, minus1, mul2];
const result = pipeline.reduce((total, func) => {
 return func(total);
}, 1);

result; // ((1 + 1 + 1 - 1) * 0.5 - 1) * 2 = 0
```

### References

我並沒有記下關於這些陣列方法的所有細節。如果您感興趣，可以繼續聯結到以下的資料：

* [Free Code Camp "How JavaScript’s Reduce method works, when to use it, and some of the cool things it can do"][FCC]
* [Josh Pitzalis "The Trouble With Loops"][0]
* [egghead.io "Asynchronous Programming: The End of The Loop][1]
* [MDN "Array.prototype.reduce()"][2]
* [ECMAScript5 Specification "array.prototype.reduce][3]
* [Stack Overflow "How to break on reduce method"][4]
* [Mozilla.tw "從 JavaScript 的 Map/Reduce 談起 Functional Programming"][5]
* [David Flanagan "JavaScript: The Definitive Guide"][JSDG]

[FCC]:https://medium.freecodecamp.com/reduce-f47a7da511a9#.la9iamjnj
[JSDG]:http://shop.oreilly.com/product/9780596805531.do
[0]:https://medium.com/@joshpitzalis/the-trouble-with-loops-f639e3cc52d9#.j2rus4zbm
[1]:https://egghead.io/courses/mastering-asynchronous-programming-the-end-of-the-loop
[2]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce:
[3]:http://www.ecma-international.org/ecma-262/6.0/#sec-array.prototype.reduce
[4]:http://stackoverflow.com/questions/36144406/how-to-break-on-reduce-method
[5]:https://goo.gl/adrK4p

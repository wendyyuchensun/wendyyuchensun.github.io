---
title: C 與 JS 的 OR 邏輯運算元
---
今天寫 C 語言的練習題時，遇到個狀況：

希望達到的目的是，當變數 `store` 不為 0 時，
取用 `store` 的值，否則用 `getchar` 取一個字元。

因為[平常 JS 寫習慣](https://www.ecma-international.org/ecma-262/9.0/index.html#sec-binary-bitwise-operators)，
所以自然而然寫了：

```c
int store = 0;
int c = store || getchar();
```

但奇怪的是，上面不管 `getchar` 結果為何，`c` 都是 1！

後來一翻 [C11 Specification](https://port70.net/~nsz/c/c11/n1570.html#6.5.14)，
一切又瞬間豁然開朗了。
原來**在 C 語言裡，`||` OR 邏輯運算元只會回傳 1 或 0，
當運算元兩端其中之一不為 0 時，回傳會是 1**。

所以上面的程式碼應該改寫成：

```c
int store = 0;

if (store == 0)
  c = getchar();
else
  c = store;
```

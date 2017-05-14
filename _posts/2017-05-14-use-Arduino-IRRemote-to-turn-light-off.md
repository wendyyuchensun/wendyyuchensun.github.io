---
title: 用 Arduino 紅外線控制關燈
keywords: Arduino, IRRemote
categories: diy
---
<figure>
  <iframe src="https://www.youtube.com/embed/6VKgKNWoLc4" frameborder="0" allowfullscreen></iframe>
  <figcaption>鏡頭外，按下紅外線遙控器，關燈。馬達在右邊，固定在電燈開關面板上；Arduino 與紅外線接收器則在書櫃下鐵網架處。</figcaption>
</figure>


### 背景

最近稍微碰一點
Arduino，想要做一個遠距離關燈器試試，但是因為租屋的關係，沒辦法改電燈電路，所以沒辦法用按某個按鈕就接通電燈電路的手法。

後來，在 Youtube
上搜尋到有人用馬達模擬按下電燈開關的作法，心想這不失是一個避開更動電路的方式，所以這個禮拜就著手把這個紅外線關燈器做出來了。

### 過程

#### 程式

這部分其實很簡單，就是達成接收到紅外線遙控器的訊號後，向伺服馬達發送出執行特定動作的訊號。因為不太難，所以就不放上程式碼了。用到的
Library 有常見的 Servo 和 [IRRemote][2]。對紅外線的接收／解碼或是如何讓伺服馬達轉動有疑問的話，可以參考 <a href="#ref">References</a> 裡葉難的兩篇文章。

#### 設計

沒有**開燈**功能，因為個人習慣是，大多數開燈的時機是為起床，既然要起床就爬起來走一走順變開燈，比較容易清醒，所以我只做期盼已久的關燈功能。

#### DeBug Time!

其實前面提到的程式部分，很早就完成了，也測試確認馬達可以像手指關燈一樣推動電燈開關；但是，在這之後，大部分時間都花在
debug 上，用得時間比寫程式還多。

Bug 大多與原本大致可以 work
的程式無關，而是到了真實環境下有很多雜訊。例如，剛開燈時，偶爾會有一點紅外線產生，此時若程式的邏輯是**任何紅外線訊號**都可以觸發馬達的行為，而非只有特定遙控器發射出來的訊號的話，那麼會造成開燈時也會觸發馬達按下開關，然後已經點亮的電燈會立刻熄滅。XD

我花了一些時間思考究竟該如何縮小觸發馬達的訊號範圍，以及使用便利性、機器擺放位置等因素之間的權衡。這部分花的時間比寫程式還久些，看來像是[《人月神話》][4] 等專案研究顯示，將專案時間切分成 1/2 debug、只有 1/6 寫程式是可能符合實情與經驗的。

### Result

<figure>
  <iframe src="https://www.youtube.com/embed/HBQzwds-sfY" frameborder="0" allowfullscreen></iframe>
  <figcaption>單看伺服馬達的部分。按紅外線遙控器是在鏡頭之外。</figcaption>
</figure>

<figure>
  <iframe src="https://www.youtube.com/embed/bmQVhHCHJUY" frameborder="0" allowfullscreen></iframe>
  <figcaption>單看 Arduino 與紅外線接收器的部分。當收到紅外線訊號時，Arduino
的 Pin 13 腳位會閃爍提示有偵測到紅外線，但我設定成只有特定訊號會啟動馬達。</figcaption>
</figure>

我對 Arduino
還只是個入門初學者，對於微控制這個領域的知識還不夠深刻，所以很歡迎各位先進指點這第一個 Arduino project 能夠進步的地方。

<h3 id="ref">References</h3>

* [葉難 "Arduino 練習：紅外線傳送與接收"][1]
* [葉難 "Arduino 練習：伺服馬達以 Tower Pro SG90 為例"][3]

[1]:http://yehnan.blogspot.tw/2013/05/arduino.html
[2]:https://github.com/z3t0/Arduino-IRremote
[3]:http://yehnan.blogspot.tw/2013/09/arduinotower-pro-sg90.html
[4]:https://goo.gl/GjJY9r

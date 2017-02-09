$(window).scroll(() => {
  var body2Top = $("body").scrollTop();
  if (body2Top <= 450) {
    var base = body2Top / 450;
    var bgCoverO = "rgba(33, 33, 33, " + 0.5 * base + ")";
    var headerBgO = 0.75 + 0.25 * base;
    var headerBg = "rgba(255, 255, 255, " + headerBgO + ")";
    var headerBsW = 4 - 3 * base;
    var headerBsCOff = 10 - 10 * base;
    var headerBs = "0 " + headerBsW + "px " + headerBsCOff + "px rgba(0, 0, 0, 0.3)";
    $("#bgcover").css("background-color", bgCoverO);
    var headerAltStyle = {
      backgroundColor: headerBg,
      boxShadow: headerBs 
    };
    $("header").css(headerAltStyle);
  }  
})

var pageAnimation = () => {
  $(window).scroll(() => {
    var body2Top = $("body").scrollTop();
    if (body2Top <= 450) {
      var base = body2Top / 450;
      var bgCoverO = "rgba(33, 33, 33, " + 0.5 * base + ")";
      var headerBgO = 0.75 + 0.25 * base;
      var headerBg = "rgba(255, 255, 255, " + headerBgO + ")";
      var headerBsW = 4 - 3 * base;
      var headerBsCOff = 10 - 10 * base;
      var headerBsO = 0.3 - 0.2 * base;
      var headerBs = "0 " + headerBsW + "px " + headerBsCOff + "px rgba(33, 33, 33, " + headerBsO + ")";
      $("#bgcover").css("background-color", bgCoverO);
      var headerAltStyle = {
        backgroundColor: headerBg,
        boxShadow: headerBs 
      };
      $("header").css(headerAltStyle);
    }
  })
};

$(document).ready(() => {
  var pathArray = window.location.pathname.split('/');
  var category = pathArray[1];
  if (category.includes(".html")) {
    category = category.replace(".html", "");
    $("header").css({
      "background-color": "rgba(255, 255, 255, 1)",
      "box-shadow": "0 1px 0px rgba(33, 33, 33, 0.1)"
    });
  } else {
    pageAnimation();
  };
  if (category !== "hire-me") {
    if (category === "") {
      category = "about";
    };
    $("#" + category).addClass("marked");
  }
  $(".navitem").hover(function() {
    if (this.id !== category && this.id !== "hire-me") {
      $("#" + this.id).toggleClass("hovered");
    }
  });
});

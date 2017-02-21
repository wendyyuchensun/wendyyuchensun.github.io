$(document).ready(() => {
  // nav open and close animation at bp <= 768px
  $("#menu").click(function() {
    setTimeout(function() {
      $("#menu").css({
        "display": "none"
      });  
      $("#close").css({
        "display": "block"
      });
    }, 250);
    $("nav").css("max-height", "5em");
  });
  $("#close").click(function() {
    setTimeout(function() {
      $("#menu").css({
        "display": "block"
      });  
      $("#close").css({
        "display": "none"
      });
    }, 250);
    $("nav").css("max-height", 0);
  });
  // nav marked when selected
  var path = window.location.pathname.slice(1);
  var category;
  if (path !== "") {
    var pathArr = path.split("/");
    category = pathArr[0];
  };
  $("#" + category).addClass("marked");
  $(".navitem").hover(function() {
    if (this.id !== category) {
      $("#" + category).toggleClass("marked");
      $("#" + this.id).toggleClass("marked");
    }
  }); 
});

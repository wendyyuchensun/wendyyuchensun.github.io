// Video-container RWD
const vc = document.getElementsByClassName("video-container");

if (vc.length) {
  const vcHeight = vc[0].offsetWidth * 315 / 560 + "px";
  for (let i = 0; i < vc.length; i++) {
    vc[i].style.height = vcHeight;
  };
};

function highlightMenu() {
  var soon = document.getElementById("coming-soon");

  if (soon === null) {
    return;
  }

  var links = document.querySelectorAll('.menu a[href^="#"]');

  var atSoon = soon.getBoundingClientRect().top <= 120;

  links.forEach(function (link) {
    var isSoonLink = link.getAttribute("href") === "#coming-soon";
    link.classList.toggle("current", isSoonLink === atSoon);
  });
}

var scrollPending = false;

window.addEventListener(
  "scroll",
  function () {
    if (scrollPending) {
      return;
    }

    scrollPending = true;

    window.requestAnimationFrame(function () {
      scrollPending = false;
      highlightMenu();
    });
  },
  { passive: true }
);

highlightMenu();

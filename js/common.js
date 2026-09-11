var NARROW = window.matchMedia("(max-width: 760px)");

var drawer = null;
var toggle = null;

function setupMobileNav() {
  var bar = document.querySelector(".top-bar-inner");
  var menu = document.querySelector(".menu");
  var buttons = document.querySelector(".auth-buttons");

  if (bar === null || buttons === null) {
    return;
  }

  if (toggle === null) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "menu-toggle";
    toggle.setAttribute("aria-label", "Menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "mobile-drawer");

    toggle.appendChild(document.createElement("span"));

    toggle.onclick = function () {
      setDrawerOpen(toggle.getAttribute("aria-expanded") !== "true");
    };

    bar.appendChild(toggle);

    drawer = document.createElement("div");
    drawer.className = "mobile-drawer";
    drawer.id = "mobile-drawer";
    drawer.hidden = true;
    document.querySelector(".top-bar").appendChild(drawer);
  }

  var worthCollapsing = menu !== null && menu.children.length > 0;
  toggle.classList.toggle("is-needed", worthCollapsing);

  placeNav(worthCollapsing);
}

function placeNav(worthCollapsing) {
  var bar = document.querySelector(".top-bar-inner");
  var menu = document.querySelector(".menu");
  var buttons = document.querySelector(".auth-buttons");

  if (NARROW.matches && worthCollapsing) {
    if (menu !== null) {
      drawer.appendChild(menu);
    }
    drawer.appendChild(buttons);
    return;
  }

  setDrawerOpen(false);

  if (menu !== null) {
    bar.appendChild(menu);
  }
  bar.appendChild(buttons);
  bar.appendChild(toggle);
}

function setDrawerOpen(open) {
  if (drawer === null || toggle === null) {
    return;
  }

  drawer.hidden = !open;
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
}

document.addEventListener("click", function (event) {
  if (drawer === null || drawer.hidden) {
    return;
  }

  if (event.target.closest("a") !== null && drawer.contains(event.target)) {
    setDrawerOpen(false);
    return;
  }

  if (!drawer.contains(event.target) && !toggle.contains(event.target)) {
    setDrawerOpen(false);
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    setDrawerOpen(false);
  }
});

NARROW.addEventListener("change", function () {
  if (toggle !== null) {
    placeNav(toggle.classList.contains("is-needed"));
  }
});

function setupPasswordToggles() {
  var toggles = document.querySelectorAll(".password-toggle");

  toggles.forEach(function (button) {
    var field = button.closest(".password-field");
    var input = field === null ? null : field.querySelector("input");

    if (input === null) {
      return;
    }

    button.hidden = false;

    button.onclick = function () {
      var nowVisible = input.type === "password";

      input.type = nowVisible ? "text" : "password";
      button.textContent = nowVisible ? "Hide" : "Show";
      button.setAttribute("aria-pressed", nowVisible ? "true" : "false");

      var at = input.value.length;
      input.focus();
      input.setSelectionRange(at, at);
    };
  });
}

setupMobileNav();
setupPasswordToggles();

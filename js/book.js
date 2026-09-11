var TICKET_PRICE_CENTAVOS = 22000;

var dateSelect = document.getElementById("date");
var showtimeSelect = document.getElementById("showtime");
var pickFirst = document.getElementById("pick-first");
var seatsAndSnacks = document.getElementById("seats-and-snacks");

var allShowtimes = Array.prototype.slice.call(showtimeSelect.options).slice(1);

function peso(centavos) {
  var pesos = Math.round(Number(centavos) / 100);
  return "₱" + pesos.toLocaleString("en-PH");
}

function seatInputs() {
  return Array.prototype.slice.call(document.querySelectorAll(".seat input"));
}

function chosenSeats() {
  var seats = [];

  document.querySelectorAll(".seat input:checked").forEach(function (input) {
    seats.push(input.value);
  });

  return seats;
}

function chosenSnacks() {
  return Array.prototype.slice.call(document.querySelectorAll(".snack input:checked"));
}

function selectedText(select) {
  if (select === null || select.value === "") {
    return "";
  }

  return select.options[select.selectedIndex].text;
}

function fillShowtimes() {
  showtimeSelect.innerHTML = '<option value="">Choose a showtime</option>';

  allShowtimes.forEach(function (option) {
    if (option.dataset.date !== dateSelect.value) {
      return;
    }

    var copy = option.cloneNode(true);
    var taken = takenSeats(copy);
    var free = 70 - taken.length;

    if (free === 0) {
      copy.textContent += " — full";
      copy.disabled = true;
    } else if (free <= 10) {
      copy.textContent += " — " + free + " seats left";
    }

    showtimeSelect.appendChild(copy);
  });

  showtimeSelect.disabled = dateSelect.value === "";
}

function takenSeats(option) {
  var list = option.dataset.taken || "";

  if (list === "ALL") {
    return seatInputs().map(function (input) {
      return input.value;
    });
  }

  if (list === "FULL-BUT-SIX") {
    return seatInputs()
      .map(function (input) {
        return input.value;
      })
      .slice(0, 64);
  }

  return list === "" ? [] : list.split(",");
}

function drawSeats() {
  var option = showtimeSelect.options[showtimeSelect.selectedIndex];
  var taken = showtimeSelect.value === "" ? [] : takenSeats(option);

  seatInputs().forEach(function (input) {
    var isTaken = taken.indexOf(input.value) !== -1;
    var box = input.nextElementSibling;

    input.checked = false;
    input.disabled = isTaken;
    box.classList.toggle("seat-box-sold", isTaken);

    if (isTaken) {
      input.closest(".seat").title = "Seat " + input.value + " is taken";
    } else {
      input.closest(".seat").removeAttribute("title");
    }
  });
}

function updateSummary() {
  var seats = chosenSeats();
  var snacks = chosenSnacks();

  var when = selectedText(dateSelect);
  var time = selectedText(showtimeSelect);

  document.getElementById("summary-when").textContent =
    when === "" || time === "" ? "Choose a date and showtime" : when + ", " + time;

  document.getElementById("summary-seats").textContent =
    seats.length === 0 ? "Tap the seats above" : seats.join(", ");

  document.getElementById("summary-snacks").textContent =
    snacks.length === 0
      ? "Tick any items above"
      : snacks
          .map(function (input) {
            return input.dataset.name;
          })
          .join(", ");

  var snackTotal = snacks.reduce(function (sum, input) {
    return sum + Number(input.dataset.price);
  }, 0);

  var ticketTotal = seats.length * TICKET_PRICE_CENTAVOS;

  document.getElementById("summary-tickets").textContent =
    seats.length +
    (seats.length === 1 ? " ticket × " : " tickets × ") +
    peso(TICKET_PRICE_CENTAVOS);

  document.getElementById("summary-amount").textContent = peso(ticketTotal + snackTotal);
}

function revealIfReady() {
  var ready = dateSelect.value !== "" && showtimeSelect.value !== "";

  pickFirst.classList.toggle("hidden", ready);
  seatsAndSnacks.classList.toggle("hidden", !ready);

  return ready;
}

dateSelect.onchange = function () {
  fillShowtimes();
  revealIfReady();
  drawSeats();
  updateSummary();
};

showtimeSelect.onchange = function () {
  revealIfReady();
  drawSeats();
  updateSummary();
};

document.querySelectorAll(".seat input, .snack input").forEach(function (input) {
  input.onchange = updateSummary;
});

document.getElementById("confirm").onclick = function () {
  var message = document.getElementById("booking-message");

  if (showtimeSelect.value === "") {
    showMessage(message, "Choose a date and a showtime first.");
    return;
  }

  if (chosenSeats().length === 0) {
    showMessage(message, "Choose at least one seat.");
    return;
  }

  window.location.href = "ticket.html";
};

function showMessage(element, text) {
  if (element === null) {
    return;
  }

  if (!text) {
    element.textContent = "";
    element.classList.add("hidden");
    return;
  }

  element.textContent = text;
  element.className = "form-message form-message-error";
}

fillShowtimes();
revealIfReady();
drawSeats();
updateSummary();

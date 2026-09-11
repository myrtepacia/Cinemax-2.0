var GROUPS = ["preparing", "ready", "sold"];

var NEXT_STATUS = { preparing: "ready", ready: "sold" };

var LABELS = { preparing: "Preparing", ready: "Ready", sold: "Sold" };

function control(row, status) {
  var next = NEXT_STATUS[status];

  if (next === undefined) {
    var done = document.createElement("span");
    done.className = "sold-tag";
    done.textContent = "Sold";
    return done;
  }

  var select = document.createElement("select");
  select.className = "order-status";

  [status, next].forEach(function (option, index) {
    var element = document.createElement("option");
    element.value = option;
    element.textContent = LABELS[option];
    element.selected = index === 0;
    select.appendChild(element);
  });

  select.onchange = function () {
    moveOrder(row, select, select.value);
  };

  return select;
}

function moveOrder(row, select, status) {
  document.getElementById("group-" + status).appendChild(row);

  row.replaceChild(control(row, status), select);

  refreshCounts();
}

function refreshCounts() {
  GROUPS.forEach(function (group) {
    var count = document.getElementById("group-" + group).children.length;

    document.getElementById("count-" + group).textContent = String(count);
    document.getElementById("empty-" + group).classList.toggle("hidden", count > 0);
  });
}

document.querySelectorAll(".order-status").forEach(function (select) {
  var row = select.closest(".order-row");

  select.onchange = function () {
    moveOrder(row, select, select.value);
  };
});

refreshCounts();

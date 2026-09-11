var cameraVideo = document.getElementById("camera-video");
var cameraMessage = document.getElementById("camera-message");
var scanResult = document.getElementById("scan-result");
var scanActions = document.getElementById("scan-actions");
var confirmBooking = document.getElementById("confirm-booking");
var cancelBooking = document.getElementById("cancel-booking");
var startCamera = document.getElementById("start-camera");
var closeCamera = document.getElementById("close-camera");

var cameraStream = null;
var waitingFor = null;

var BOOKINGS = {
  "CMX-8F41K2": { name: "Juan Dela Cruz", movie: "Joker", seats: "C5, C6", used: false },
  "CMX-3D07Q9": { name: "Ana Reyes", movie: "Pieces of Us", seats: "F2", used: true },
  "CMX-5A22M6": { name: "Paolo Cruz", movie: "Eternal Sunshine", seats: "B7, B8", used: false }
};

function openCamera() {
  if (!navigator.mediaDevices) {
    cameraMessage.textContent =
      "The camera only works when the page is opened over https, or on localhost.";
    return;
  }

  stopCamera();
  cameraMessage.textContent = "Starting the camera";

  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: { exact: "environment" } } })
    .then(showCamera)
    .catch(function () {
      return navigator.mediaDevices.getUserMedia({ video: true }).then(showCamera);
    })
    .catch(function (error) {
      cameraMessage.textContent = "The camera could not be opened: " + error.message;
    });
}

function facesAway(track) {
  var settings = track.getSettings ? track.getSettings() : {};

  if (settings.facingMode === "environment") {
    return true;
  }

  if (settings.facingMode === "user") {
    return false;
  }

  var name = String(track.label).toLowerCase();

  return name.indexOf("back") !== -1 || name.indexOf("rear") !== -1;
}

function showCamera(stream) {
  cameraStream = stream;
  cameraVideo.srcObject = stream;
  cameraMessage.textContent = facesAway(stream.getVideoTracks()[0])
    ? "Back camera is on. Hold a ticket up to it."
    : "Camera is on. Hold a ticket up to it.";

  startCamera.classList.add("hidden");
  closeCamera.classList.remove("hidden");
  startReading();
}

function stopCamera() {
  stopReading();
  clearAnswer();

  if (cameraStream !== null) {
    var tracks = cameraStream.getTracks();

    for (var i = 0; i < tracks.length; i += 1) {
      tracks[i].stop();
    }

    cameraStream = null;
  }

  cameraVideo.srcObject = null;
  startCamera.classList.remove("hidden");
  closeCamera.classList.add("hidden");
  cameraMessage.textContent = "Camera is off";
}

var readingTimer = null;
var waitUntil = 0;
var scanCanvas = document.createElement("canvas");
var scanPad = scanCanvas.getContext("2d", { willReadFrequently: true });

function startReading() {
  stopReading();
  readingTimer = setInterval(readPicture, 100);
}

function stopReading() {
  if (readingTimer !== null) {
    clearInterval(readingTimer);
    readingTimer = null;
  }

  waitUntil = 0;
}

function readPicture() {
  if (Date.now() < waitUntil) {
    return;
  }

  if (cameraVideo.readyState < 2 || cameraVideo.videoWidth === 0) {
    return;
  }

  if (typeof jsQR !== "function") {
    cameraMessage.textContent = "The QR reader did not load, so js/jsQR.js may be missing";
    stopReading();
    return;
  }

  scanCanvas.width = cameraVideo.videoWidth;
  scanCanvas.height = cameraVideo.videoHeight;
  scanPad.drawImage(cameraVideo, 0, 0, scanCanvas.width, scanCanvas.height);

  var picture = scanPad.getImageData(0, 0, scanCanvas.width, scanCanvas.height);
  var found = jsQR(picture.data, picture.width, picture.height, { inversionAttempts: "dontInvert" });

  if (found !== null) {
    checkTicket(found.data);
  }
}

function checkTicket(text) {
  waitingFor = null;
  scanActions.classList.add("hidden");

  var booking = BOOKINGS[text];

  if (booking === undefined) {
    showAnswer("bad", "Not a valid ticket", "No booking matches " + text);
    waitUntil = Date.now() + 2500;
    return;
  }

  var describe = booking.name + " • " + booking.movie + " • Seats " + booking.seats;

  if (booking.used) {
    showAnswer("used", "Already scanned", describe);
    waitUntil = Date.now() + 2500;
    return;
  }

  waitingFor = text;
  showAnswer("good", "Valid ticket", describe);
  scanActions.classList.remove("hidden");
  stopReading();
}

function showAnswer(kind, heading, detail) {
  scanResult.className = "scan-result scan-result-" + kind;
  scanResult.textContent = heading;

  var line = document.createElement("span");
  line.className = "scan-result-who";
  line.textContent = detail;
  scanResult.appendChild(line);
}

function clearAnswer() {
  scanResult.className = "scan-result hidden";
  scanResult.textContent = "";
  scanActions.classList.add("hidden");
  waitingFor = null;
}

confirmBooking.onclick = function () {
  if (waitingFor !== null) {
    BOOKINGS[waitingFor].used = true;
  }

  clearAnswer();
  cameraMessage.textContent = "Let them in. Ready for the next ticket.";

  if (cameraStream !== null) {
    startReading();
  }
};

cancelBooking.onclick = function () {
  clearAnswer();

  if (cameraStream !== null) {
    startReading();
  }
};

startCamera.onclick = openCamera;
closeCamera.onclick = stopCamera;

clearAnswer();

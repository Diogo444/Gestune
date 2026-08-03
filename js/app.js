import { FilesetResolver, HandLandmarker } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/+esm";
import { MusicPlayer } from "./audio.js";
import { drawHand, detectRaisedFingers } from "./hand.js";
import { emptyHandStates, FINGER_NAMES, noteLabel } from "./notes.js";

const startButton = document.querySelector("#start-button");
const status = document.querySelector("#status");
const detectedHand = document.querySelector("#detected-hand");
const detectedFingers = document.querySelector("#detected-fingers");
const video = document.querySelector("#webcam");
const canvas = document.querySelector("#canvas");
const context = canvas.getContext("2d");

const music = new MusicPlayer();
let landmarker;
let cameraStarted = false;
let lastVideoTime = -1;
let previousStates = emptyHandStates();

async function loadModel() {
  try {
    status.textContent = "Chargement des fichiers MediaPipe…";
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
    landmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.5,
      minHandPresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    status.textContent = "Modèle chargé. Tu peux activer la caméra.";
    startButton.disabled = false;
  } catch (error) {
    console.error("Erreur MediaPipe :", error);
    status.textContent = "Impossible de charger le modèle MediaPipe.";
  }
}

async function startCameraAndAudio() {
  if (!landmarker || cameraStarted) return;
  try {
    startButton.disabled = true;
    status.textContent = "Chargement des sons de piano…";
    await music.initialize();
    status.textContent = "Demande d’accès à la caméra…";
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    await new Promise((resolve) => video.addEventListener("loadeddata", resolve, { once: true }));
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    cameraStarted = true;
    startButton.textContent = "Caméra et son activés";
    status.textContent = "Place une main ouverte devant la caméra.";
    predictWebcam();
  } catch (error) {
    console.error("Erreur de démarrage :", error);
    status.textContent = "La caméra ou le son n’a pas pu être activé.";
    startButton.disabled = false;
  }
}

function updateMusic(currentStates) {
  for (const hand of ["Left", "Right"]) {
    for (const finger of FINGER_NAMES) {
      if (currentStates[hand][finger] !== previousStates[hand][finger]) {
        music.setNote(hand, finger, currentStates[hand][finger]);
      }
    }
  }
  previousStates = currentStates;
}

function displayState(states) {
  const active = [];
  for (const hand of ["Left", "Right"]) {
    for (const finger of FINGER_NAMES) {
      if (states[hand][finger]) active.push(`${hand === "Left" ? "Gauche" : "Droite"} — ${noteLabel(hand, finger)}`);
    }
  }
  detectedFingers.textContent = active.length ? `Notes actives : ${active.join(", ")}.` : "Main détectée, mais aucun doigt levé.";
}

function processResults(results) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  const hands = results.landmarks ?? [];
  if (hands.length === 0) {
    music.stopAll();
    previousStates = emptyHandStates();
    detectedHand.textContent = "Aucune main détectée.";
    detectedFingers.textContent = "Aucune main détectée.";
    return;
  }

  const currentStates = emptyHandStates();
  const detectedHands = [];
  hands.forEach((landmarks, index) => {
    const hand = results.handednesses?.[index]?.[0]?.categoryName;
    if (hand !== "Left" && hand !== "Right") return;
    currentStates[hand] = detectRaisedFingers(landmarks);
    detectedHands.push(hand === "Left" ? "gauche" : "droite");
    drawHand(context, canvas, landmarks);
  });
  detectedHand.textContent = `Main${detectedHands.length > 1 ? "s" : ""} détectée${detectedHands.length > 1 ? "s" : ""} : ${detectedHands.join(" et ")}.`;
  updateMusic(currentStates);
  displayState(currentStates);
}

function predictWebcam() {
  if (!cameraStarted) return;
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    processResults(landmarker.detectForVideo(video, performance.now()));
  }
  requestAnimationFrame(predictWebcam);
}

startButton.addEventListener("click", startCameraAndAudio);
loadModel();

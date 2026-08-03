import { emptyFingerState } from "./notes.js";

// Au-delà de cet angle, un doigt est suffisamment droit pour jouer une note.
// Une main fermée forme des angles nettement plus petits.
const EXTENDED_ANGLE = 150;

function angleAt(pointA, joint, pointB) {
  const ax = pointA.x - joint.x;
  const ay = pointA.y - joint.y;
  const az = pointA.z - joint.z;
  const bx = pointB.x - joint.x;
  const by = pointB.y - joint.y;
  const bz = pointB.z - joint.z;
  const lengthA = Math.hypot(ax, ay, az);
  const lengthB = Math.hypot(bx, by, bz);
  if (!lengthA || !lengthB) return 0;
  const cosine = Math.max(-1, Math.min(1, (ax * bx + ay * by + az * bz) / (lengthA * lengthB)));
  return Math.acos(cosine) * 180 / Math.PI;
}

function isExtended(landmarks, base, joint, tip) {
  return angleAt(landmarks[base], landmarks[joint], landmarks[tip]) >= EXTENDED_ANGLE;
}

export function detectRaisedFingers(landmarks) {
  if (!landmarks || landmarks.length !== 21) return emptyFingerState();

  return {
    // L'angle du pouce évite le faux positif de la comparaison x seule.
    thumb: isExtended(landmarks, 2, 3, 4),
    index: isExtended(landmarks, 5, 6, 8),
    middle: isExtended(landmarks, 9, 10, 12),
    ring: isExtended(landmarks, 13, 14, 16),
    pinky: isExtended(landmarks, 17, 18, 20)
  };
}

export function drawHand(context, canvas, landmarks) {
  context.fillStyle = "#22d3ee";
  context.strokeStyle = "#f8fafc";
  context.lineWidth = 3;
  for (const point of landmarks) {
    context.beginPath();
    context.arc(point.x * canvas.width, point.y * canvas.height, 6, 0, Math.PI * 2);
    context.fill();
    context.stroke();
  }
}

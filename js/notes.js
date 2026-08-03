export const FINGERS = {
  thumb: "Pouce",
  index: "Index",
  middle: "Majeur",
  ring: "Annulaire",
  pinky: "Auriculaire"
};

export const FINGER_NAMES = Object.keys(FINGERS);

// Chaque main joue une octave différente : elles peuvent jouer ensemble.
export const HAND_NOTES = {
  Left: { thumb: "C3", index: "D3", middle: "E3", ring: "F3", pinky: "G3" },
  Right: { thumb: "C4", index: "D4", middle: "E4", ring: "F4", pinky: "G4" }
};

export function emptyFingerState() {
  return Object.fromEntries(FINGER_NAMES.map((name) => [name, false]));
}

export function emptyHandStates() {
  return { Left: emptyFingerState(), Right: emptyFingerState() };
}

export function noteLabel(hand, finger) {
  return `${FINGERS[finger]} : ${HAND_NOTES[hand][finger]}`;
}

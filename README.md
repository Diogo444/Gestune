# Gestune — comment cela fonctionne

## Les deux parties du projet

1. **MediaPipe Hand Landmarker** regarde chaque image de la webcam et place 21 repères sur la main.
2. **Tone.js** transforme l'état des doigts en notes de musique.

Le modèle ne reconnaît pas les mots « main fermée » ou « index levé ». Il reçoit une image et renvoie simplement des coordonnées normalisées : `x` (gauche/droite), `y` (haut/bas) et `z` (profondeur). Par exemple, les repères `0`, `5`, `6` et `8` correspondent respectivement au poignet, à la base de l'index, à son articulation centrale et à son bout.

```text
Webcam → MediaPipe → 21 coordonnées → règles dans js/hand.js → Tone.js → haut-parleurs
```

## Savoir si un doigt est ouvert

Le fichier `js/hand.js` ne demande pas au modèle si le doigt est ouvert. Il calcule lui-même l'angle formé par trois repères : base → articulation → bout du doigt.

```text
doigt droit :       base ─── articulation ─── bout       ≈ 180° → note
doigt replié :      base ─── articulation
                               ╲ bout                     < 150° → silence
```

Un angle d'au moins `150°` active la note. Ce seuil se règle avec `EXTENDED_ANGLE` dans `js/hand.js` : augmente-le si des doigts légèrement pliés jouent encore, baisse-le si l'application ne reconnaît pas tes doigts tendus.

Le pouce utilise désormais exactement cette logique. C'est important : son ancienne comparaison gauche/droite pouvait considérer un pouce replié comme ouvert.

## Main gauche ou droite

Oui : MediaPipe renvoie aussi une catégorie `Left` ou `Right` avec chaque main. L'application affiche maintenant « Main gauche détectée » ou « Main droite détectée » sous son statut. Les règles d'angle fonctionnent de la même façon pour les deux mains, puisque l'angle d'un doigt ne dépend pas du côté.

L'application analyse maintenant jusqu'à deux mains (`numHands: 2`). La main gauche joue `C3` à `G3`, et la main droite `C4` à `G4`, ce qui permet de les jouer simultanément sans conflit.

## Modifier les notes et le son

Dans `js/notes.js`, modifie les notes de `HAND_NOTES` :

```js
Right: { thumb: "C4", index: "D4", middle: "E4", ring: "F4", pinky: "G4" }
```

- `C4` est un Do ; `C5` est le même Do, une octave plus haut.
- Pour un son plus grave, essaie `C3`, `D3`, etc.
- Pour régler le volume global, modifie `new Tone.Volume(-12)` dans `js/audio.js`. Une valeur plus petite, par exemple `-18`, est moins forte.

Tone.js joue désormais des échantillons de piano. Ils sont téléchargés au premier clic sur le bouton : cette première activation peut donc prendre une seconde selon la connexion.

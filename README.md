# super_zoom

[Français](#français) · [English](#english)

---

## Français

**super_zoom** est un plugin [Piwigo](https://piwigo.org/) qui ajoute un zoom plein écran sur la page d'une photo : une fenêtre (modale) dans laquelle on peut agrandir l'image jusqu'à 5× et la déplacer, à la souris, au touchpad ou au doigt. Il est conçu pour le thème **Bootstrap Darkroom**, sur tous les appareils (PC, Mac, mobiles, tablettes). Il fonctionne aussi avec les thèmes **Modus** et **Elegant**, uniquement sur PC et Mac.

Le plugin s'appuie sur la bibliothèque [vanilla-js-wheel-zoom](https://github.com/worka/vanilla-js-wheel-zoom) (licence MIT, voir `LICENSE`).

### Fonctionnalités

- Une modale de zoom : agrandissement jusqu'à 5×, déplacement de l'image, boutons **+** et **−** (grisés quand la limite mini ou maxi est atteinte).
- Les mêmes gestes sur mobile, tablette, écran tactile, touchpad et souris (voir le tableau ci-dessous).
- Lien direct : l'adresse `…#zoom` ouvre la modale, le bouton « retour » du navigateur la ferme.
- Le zoom utilise l'image **originale** (ou la plus grande version dérivée sans filigrane si un filigrane est actif).
- Un bouton loupe sur la photo ou dans la barre d'actions du thème (au choix dans l'administration).
- Sur mobile (< 768 px), la loupe est masquée : on ouvre le zoom par double tap ou pinch, et un swipe change de photo.

### Gestes

| Geste | Mobile / écran tactile | Touchpad | Souris | Clavier |
|---|---|---|---|---|
| Changement de photo | swipe ; tap à gauche, tap à droite | tap à gauche, tap à droite | clic à gauche, clic à droite ; clic sur les flèches de navigation | flèche gauche, flèche droite |
| Ouvrir la modale zoom | pinch, double tap | pinch, double tap | double clic, Ctrl + molette vers le haut, clic sur la loupe | |
| Fermer la modale zoom | double tap, tap sur ✕ | double tap, tap sur ✕ | double clic, clic sur ✕ | |

Remarques :

- « Tap à gauche / à droite » désigne les zones précédent / suivant de la photo (image map de Piwigo).
- Sur ordinateur, un clic simple sur ces zones est exécuté avec un léger délai (350 ms) pour laisser passer le second clic d'un double clic. Un clic avec Ctrl, Maj, Alt ou Cmd garde son comportement normal (ouverture dans un nouvel onglet, etc.).
- Dans la modale, les boutons **+**, **−** et **✕** ne déclenchent pas la fermeture par double tap.
- Sur Mac / Safari, le pinch au touchpad ouvre la modale ; sur les autres navigateurs, il arrive comme Ctrl + molette.

### Installation

1. Copier le dossier `super_zoom` dans `plugins/` de votre Piwigo (ou l'installer depuis l'Extension Manager, PEM).
2. Activer le plugin dans **Administration → Plugins**.
3. Régler la position du bouton loupe dans la page de configuration du plugin : **sur la photo** ou **dans la barre de navigation** de la photo.

### Compatibilité

- **Bootstrap Darkroom** (PC, Mac, mobiles, tablettes) : les gestes tactiles du plugin tiennent compte du double tap / PhotoSwipe et du carrousel du thème. Le titre du site passe à la ligne sur mobile (sinon il fait déborder la page).
- **Modus**, **Elegant** (PC et Mac uniquement) : zoom à la souris et au touchpad. Les gestes tactiles mobiles ne sont pas pris en charge avec ces thèmes.
- **Filigrane** : le zoom utilise la plus grande version sans filigrane, pas l'original.
- **private_derivative_protection** : l'URL de l'image passe par le filtre `get_original_url`.
- **Back2Front** : le verso est zoomable comme le recto.
- **Photosphères** et **vidéos** : le plugin ne fait rien (pas de zoom, pas d'erreur).

### Configuration

Une seule option, `button_position` : `photo` (par défaut) ou `navbar`. Elle est enregistrée dans le paramètre `super_zoom_config`. La désinstallation la supprime ; la désactivation la conserve.

### Historique

Voir le commentaire en tête de `main.inc.php` (français, version la plus récente en haut).

### Licence

Le plugin utilise vanilla-js-wheel-zoom, © 2020 worka, sous licence MIT (fichier `LICENSE`).

---

## English

**super_zoom** is a [Piwigo](https://piwigo.org/) plugin that adds a full-screen zoom to the photo page: a modal window where the image can be magnified up to 5× and panned, with a mouse, a touchpad or a finger. It is designed for the **Bootstrap Darkroom** theme, on every device (PC, Mac, phones, tablets). It also works with the **Modus** and **Elegant** themes, on PC and Mac only.

It is built on [vanilla-js-wheel-zoom](https://github.com/worka/vanilla-js-wheel-zoom) (MIT license, see `LICENSE`).

### Features

- A zoom modal: up to 5× magnification, image panning, **+** and **−** buttons (greyed out when the minimum or maximum scale is reached).
- The same gestures on phone, tablet, touchscreen, touchpad and mouse (see the table below).
- Deep link: a URL ending in `#zoom` opens the modal, and the browser's back button closes it.
- The zoom uses the **original** image (or the largest watermark-free derivative when a watermark is active).
- A magnifier button on the photo or in the theme's action bar (your choice, in the administration).
- On mobile (< 768 px) the magnifier is hidden: open the zoom with a double tap or a pinch, and swipe to change photo.

### Gestures

| Gesture | Mobile / touchscreen | Touchpad | Mouse | Keyboard |
|---|---|---|---|---|
| Change photo | swipe; tap left, tap right | tap left, tap right | click left, click right; click the navigation arrows | left arrow, right arrow |
| Open the zoom modal | pinch, double tap | pinch, double tap | double click, Ctrl + wheel up, click the magnifier | |
| Close the zoom modal | double tap, tap ✕ | double tap, tap ✕ | double click, click ✕ | |

Notes:

- "Tap left / right" refers to the previous / next areas of the photo (Piwigo's image map).
- On desktop, a single click on those areas is carried out after a short delay (350 ms) so that the second click of a double click can go through. A click with Ctrl, Shift, Alt or Cmd keeps its normal behaviour (open in a new tab, etc.).
- Inside the modal, the **+**, **−** and **✕** buttons do not trigger the double-tap close.
- On Mac / Safari the touchpad pinch opens the modal; other browsers deliver it as Ctrl + wheel.

### Installation

1. Copy the `super_zoom` folder into your Piwigo `plugins/` directory (or install it from the Extension Manager, PEM).
2. Activate the plugin in **Administration → Plugins**.
3. Set the magnifier button position on the plugin's configuration page: **on the photo** or **in the photo's navigation bar**.

### Compatibility

- **Bootstrap Darkroom** (PC, Mac, phones, tablets): the plugin's touch gestures take the theme's double tap / PhotoSwipe and carousel into account. On mobile the site title wraps (otherwise it makes the page overflow).
- **Modus**, **Elegant** (PC and Mac only): zoom with a mouse or a touchpad. Mobile touch gestures are not supported with these themes.
- **Watermark**: the zoom uses the largest watermark-free derivative, not the original.
- **private_derivative_protection**: the image URL goes through the `get_original_url` filter.
- **Back2Front**: the verso can be zoomed like the recto.
- **Photospheres** and **videos**: the plugin does nothing (no zoom, no error).

### Configuration

A single option, `button_position`: `photo` (default) or `navbar`. It is stored in the `super_zoom_config` parameter. Uninstalling removes it; deactivating keeps it.

### Changelog

See the comment at the top of `main.inc.php` (in French, newest first).

### License

The plugin uses vanilla-js-wheel-zoom, © 2020 worka, MIT license (`LICENSE` file).

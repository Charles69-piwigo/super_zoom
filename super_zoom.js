document.addEventListener('DOMContentLoaded', function () {

  // Vérifie qu'on est sur thePicturePage via l'ID du body
  if (document.body.id !== "thePicturePage") return;

  // Modal
  const openButton = document.querySelector("#superzoom-btn-open");
  const closeButton = document.querySelector("#superzoom-btn-close");
  const dialog = document.querySelector(".superzoom-dialog");

  // WheelZoom
  // Absent quand le PHP n'a pas rendu la modale (vidéo, photosphère...) : rien à faire.
  var contentElement = document.getElementById('superzoom-content');
  if (!contentElement || !dialog) return;
  var imageElement = contentElement.querySelector('img');
  if (!imageElement) return;

  // Bootstrap Darkroom lie jQuery 'swipeleft/swiperight' (= photo suivante) sur "#theImage img",
  // ce qui inclut l'image de la modale. On la remplace par un clone, sans aucun écouteur.
  var cleanImage = imageElement.cloneNode(true);
  imageElement.parentNode.replaceChild(cleanImage, imageElement);
  imageElement = cleanImage;
  var zoomUpButton = document.querySelector('[data-zoom-up]');
  var zoomDownButton = document.querySelector('[data-zoom-down]');
  var wzoom = null;
  var isModalOpen = false;

  // Fonction pour obtenir l'URL de l'image à zoomer
  function getCurrentImageUrl() {
    // Vérifier si on est sur le verso
    var versoPage = document.getElementById('theVersoImage');
    
    if (versoPage) {
      var displayStyle = window.getComputedStyle(versoPage).display;
      
      if (displayStyle !== 'none') {
        // On est sur le verso, utiliser l'URL originale du verso
        if (typeof window.jsUrlVersoSUPZ !== 'undefined') {
          return window.jsUrlVersoSUPZ;
        }
      }
    }
    
    // Par défaut, utiliser l'URL originale du recto
    if (typeof window.jsUrlSUPZ !== 'undefined') {
      return window.jsUrlSUPZ;
    }
    
    // Fallback : retourner l'image actuellement dans le modal
    return imageElement.src;
  }

  // Mettre à jour l'URL de l'image dans le modal
  function updateModalImage() {
    var currentUrl = getCurrentImageUrl();
    var modalImg = document.getElementById('superzoom-content').querySelector('img');
    
    if (modalImg && modalImg.src !== currentUrl) {
      // Détruire l'ancienne instance de WZoom SEULEMENT si elle existe
      if (wzoom && typeof wzoom.destroy === 'function') {
        try {
          wzoom.destroy();
        } catch(e) {
          console.warn('Erreur lors de la destruction de WZoom:', e);
        }
        wzoom = null;
      }
      
      // Changer l'image
      modalImg.src = currentUrl;
      
      // Attendre que la nouvelle image soit chargée avant de recréer wzoom
      modalImg.onload = function() {
        // Recréer WZoom avec les nouvelles dimensions
        wzoom = WZoom.create('#superzoom-content', {
          type: 'html',
          width: modalImg.naturalWidth,
          height: modalImg.naturalHeight,
          zoomOnClick: false,
          smoothTimeDrag: 0.1,
          maxScale: 5,
          rescale: updateZoomButtons,
          onGrab: function () {
            document.getElementById('superzoom-viewport').classList.add('superzoom-grabbing');
          },
          onDrop: function () {
            document.getElementById('superzoom-viewport').classList.remove('superzoom-grabbing');
          },
        });
        updateZoomButtons(wzoom);
      };
    }
  }

  // --- Gestion du hash #zoom dans l'URL ---

  function addZoomToUrl() {
    if (window.location.hash !== '#zoom') {
      window.history.pushState(null, '', window.location.pathname + window.location.search + '#zoom');
    }
  }

  function removeZoomFromUrl() {
    if (window.location.hash === '#zoom') {
      window.history.pushState(null, '', window.location.pathname + window.location.search);
    }
  }

  // --- Fonctions d'ouverture / fermeture de la modale ---

  // Horodatages anti-rebond : sur iOS, le 2e tap qui ouvre la modale génère ensuite un clic / dblclick
  // synthétisé qui retombe sur la modale fraîchement ouverte et la refermait aussitôt (effet « glitch »).
  var openedAt = 0;
  var lastTouchEndAt = 0;
  document.addEventListener('touchend', function() { lastTouchEndAt = Date.now(); },
    { passive: true, capture: true });

  function openZoomModal(updateUrl) {
    if (isModalOpen) return;
    dialog.showModal();
    isModalOpen = true;
    openedAt = Date.now();
    fitDialog();
    updateModalImage();
    updateZoomButtons(wzoom);
    if (updateUrl) {
      addZoomToUrl();
    }
  }

  function closeZoomModal(updateUrl) {
    if (!isModalOpen) return;

    // Retirer le focus du bouton si c'est lui qui a déclenché la fermeture
    if (document.activeElement === closeButton) {
      closeButton.blur();
    }

    // Fermer la modale
    dialog.close();
    isModalOpen = false;

    // Restaurer le focus sur le body
    document.body.focus();

    if (updateUrl) {
      removeZoomFromUrl();
    }

    // NE PAS détruire wzoom ici, on le garde pour la prochaine ouverture
  }

  // --- Event listeners pour le modal ---

  openButton.addEventListener("click", function(e) {
    e.preventDefault();
    openZoomModal(true);
  });

  closeButton.addEventListener("click", function() {
    closeZoomModal(true);
  });

  // Fermeture au clic en dehors de la modale
  // Le geste doit aussi avoir commencé en dehors : sur iOS, des taps rapides sur + / - dont le
  // clic retombe sur le fond de la modale la fermaient.
  var pressedOnDialog = false;
  dialog.addEventListener('pointerdown', function(event) {
    pressedOnDialog = event.target === dialog;
  }, true);
  dialog.addEventListener('click', function(event) {
    if (event.target === dialog && pressedOnDialog && Date.now() - openedAt > 700) {
      closeZoomModal(true);
    }
    pressedOnDialog = false;
  });

  // Fermeture avec la touche Échap (événement natif du dialog)
  dialog.addEventListener('close', function() {
    if (isModalOpen) {
      isModalOpen = false;
      document.body.focus();
      removeZoomFromUrl();
    }
  });

  // Double tap dans la modale : la ferme (symétrique de l'ouverture). Un tap = court, quasi immobile,
  // un seul doigt ; les boutons sont exclus. Écouteurs sur la modale sans stopPropagation (WZoom
  // écoute touchmove/touchend sur document). Le touchend du 2e tap est annulé (preventDefault) pour
  // que le clic synthétisé ne retombe pas sur l'image map de la photo, une fois la modale fermée.
  var modalTouch = null;
  var modalLastTap = null;

  dialog.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      modalTouch = { time: Date.now(), x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      modalTouch = null;
      modalLastTap = null;
    }
  }, { passive: true });

  dialog.addEventListener('touchend', function(e) {
    var s = modalTouch;
    modalTouch = null;
    if (!isModalOpen || !s || e.touches.length || e.changedTouches.length !== 1) return;
    if (Date.now() - openedAt < 500) return;
    if (e.target.closest && e.target.closest('.superzoom-dialog-controls')) {
      modalLastTap = null;
      return;
    }
    var t = e.changedTouches[0];
    if (Date.now() - s.time > 300 || Math.hypot(t.clientX - s.x, t.clientY - s.y) > 10) {
      modalLastTap = null;
      return;
    }
    if (modalLastTap && Date.now() - modalLastTap.time < 350 &&
        Math.hypot(t.clientX - modalLastTap.x, t.clientY - modalLastTap.y) < 40) {
      modalLastTap = null;
      if (e.cancelable) e.preventDefault();
      closeZoomModal(true);
    } else {
      modalLastTap = { time: Date.now(), x: t.clientX, y: t.clientY };
    }
  }, { passive: false });

  // Même chose au touchpad / à la souris : le double tap du touchpad arrive comme un 'dblclick'.
  dialog.addEventListener('dblclick', function(e) {
    if (e.target.closest && e.target.closest('.superzoom-dialog-controls')) return;
    // dblclick synthétisé par un double tap tactile (déjà géré par touchend) ou juste après l'ouverture
    if (Date.now() - openedAt < 700 || Date.now() - lastTouchEndAt < 800) return;
    closeZoomModal(true);
  });

  // --- Isoler la modale des gestes du thème (swipe = photo suivante) ---

  // Sortie du conteneur de la photo : les écouteurs du thème posés sur la photo ne reçoivent plus rien
  document.body.appendChild(dialog);

  // Ajuste la modale à la zone réellement visible : sur mobile, si la page déborde en largeur
  // (ex. carrousel du thème), le navigateur dézoome et 100vw ne couvre plus tout l'écran
  function fitDialog() {
    var vv = window.visualViewport;
    if (!vv) return;
    dialog.style.left = vv.offsetLeft + 'px';
    dialog.style.top = vv.offsetTop + 'px';
    dialog.style.width = vv.width + 'px';
    dialog.style.height = vv.height + 'px';
    dialog.style.maxWidth = dialog.style.maxHeight = 'none';
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function() { if (isModalOpen) fitDialog(); });
    window.visualViewport.addEventListener('scroll', function() { if (isModalOpen) fitDialog(); });
  }

  // Bootstrap Darkroom ouvre PhotoSwipe sur le 'doubletap' de #theImage (mobile) : on le retire,
  // le double tap ouvre le zoom du plugin. Après 'load' pour passer après le $(document).ready du thème.
  function offDoubleTap() {
    if (window.jQuery) window.jQuery('#theImage').off('doubletap');
  }
  if (document.readyState === 'complete') offDoubleTap();
  else window.addEventListener('load', offDoubleTap);

  // --- Image map du thème : recalage des zones précédent / album / suivant ---
  // Les coordonnées des <area> sont en pixels de la taille d'origine ; quand le CSS réduit la
  // photo (mobile), elles ne suivent pas : « précédent » couvre presque toute l'image et
  // « suivant » sort de l'écran. On les remet à l'échelle de l'image affichée.

  function rescaleAreas() {
    var img = document.querySelector('#theImage img[usemap]');
    if (!img || !img.clientWidth) return;
    var map = document.querySelector('map[name="' + img.getAttribute('usemap').replace('#', '') + '"]');
    if (!map) return;
    var areas = map.querySelectorAll('area[coords]');
    var refW = 0, refH = 0;
    areas.forEach(function(a) {
      if (!a.dataset.szCoords) a.dataset.szCoords = a.getAttribute('coords');
      var c = a.dataset.szCoords.split(',').map(Number);
      refW = Math.max(refW, c[2]);
      refH = Math.max(refH, c[3]);
    });
    if (!refW || !refH) return;
    var kx = img.clientWidth / refW, ky = img.clientHeight / refH;
    areas.forEach(function(a) {
      var c = a.dataset.szCoords.split(',').map(Number);
      a.setAttribute('coords', [c[0] * kx, c[1] * ky, c[2] * kx, c[3] * ky].map(Math.round).join(','));
    });
  }

  window.addEventListener('load', rescaleAreas);
  window.addEventListener('resize', rescaleAreas);
  window.addEventListener('orientationchange', rescaleAreas);
  if (document.readyState === 'complete') rescaleAreas();

  // --- Double tap sur la photo (tactile) : ouvre la modale ---

  // Écoute en phase de capture sur document (touchend) : on passe avant les handlers du thème
  // sur #theImage, et on coupe le touchend du 2e tap pour que le 'doubletap' (PhotoSwipe) ne se
  // déclenche jamais, quel que soit le moment où le thème le lie (le .off() ci-dessus est aléatoire
  // sur Firefox/Safari). Ne PAS bloquer touchstart : jquery.mobile-events y mémorise le point de
  // départ de ses swipes, et un état périmé déclenchait 'swiperight' (= photo précédente).
  var lastTap = null;

  function isSecondTap(t) {
    return lastTap && Date.now() - lastTap.time < 350 &&
      Math.hypot(t.clientX - lastTap.x, t.clientY - lastTap.y) < 40;
  }

  function tapTarget(e) {
    return !isModalOpen && e.target.closest && !dialog.contains(e.target) &&
      e.target.closest('#theImage, #theMainImage, .superzoom-container') &&
      e.changedTouches && e.changedTouches.length === 1 && e.touches.length <= 1;
  }

  // Piwigo place une image map (<area> précédent/suivant) sur la photo : le clic synthétisé du
  // 1er tap navigue aussitôt vers la photo voisine, avant que le 2e tap n'arrive. On diffère donc
  // la navigation de ce clic tactile ; elle est annulée si un double tap suit.
  var pendingNav = null;
  document.addEventListener('click', function(e) {
    var area = e.target.closest && e.target.closest('area[href]');
    if (!area) return;
    var touchTap = lastTap && Date.now() - lastTap.time <= 500;
    if (!touchTap) {
      // Souris / touchpad : mêmes précautions pour que le double clic (double tap touchpad) puisse
      // ouvrir la modale. Clic avec modificateur ou autre bouton : comportement normal.
      if (isModalOpen || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.detail > 1) return; // 2e clic : le 'dblclick' qui suit ouvre la modale
      clearTimeout(pendingNav);
      pendingNav = setTimeout(function() { window.location.href = area.href; }, 350);
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    clearTimeout(pendingNav);
    pendingNav = setTimeout(function() { window.location.href = area.href; }, 380);
  }, true);

  // Double clic / double tap touchpad sur la photo : ouvre la modale
  document.addEventListener('dblclick', function(e) {
    if (!pinchZone(e)) return;
    clearTimeout(pendingNav);
    e.preventDefault();
    openZoomModal(true);
  }, true);

  // --- Pinch (écartement à deux doigts) sur la photo : ouvre la modale, comme les visionneuses photo ---
  // Le geste en cours n'est pas repris par la modale : l'utilisateur relève les doigts puis pince
  // dans la modale. Le zoom natif de la page est bloqué pendant le geste (touchmove non passif,
  // et gesturestart pour Safari iOS qui ignore maximum-scale).
  var PINCH_RATIO = 1.25;
  var pinchStartDist = null;

  function pinchZone(e) {
    return !isModalOpen && e.target.closest && !dialog.contains(e.target) &&
      e.target.closest('#theImage, #theMainImage, .superzoom-container');
  }

  function touchDist(touches) {
    return Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);
  }

  document.addEventListener('touchstart', function(e) {
    pinchStartDist = (e.touches.length === 2 && pinchZone(e)) ? touchDist(e.touches) : null;
  }, { passive: true, capture: true });

  document.addEventListener('touchmove', function(e) {
    if (pinchStartDist === null || e.touches.length !== 2) return;
    if (e.cancelable) e.preventDefault();
    if (touchDist(e.touches) / pinchStartDist >= PINCH_RATIO) {
      pinchStartDist = null;
      lastTap = null;
      clearTimeout(pendingNav);
      openZoomModal(true);
    }
  }, { passive: false, capture: true });

  // Touchpad (PC / Mac) : un pinch arrive comme une molette avec ctrlKey (deltaY < 0 = écartement).
  // Au-dessus de la photo, l'écartement ouvre la modale au lieu de zoomer la page ; un pinch dans
  // la modale ne doit pas non plus zoomer la page (WZoom gère le zoom de l'image). Le dézoom et le
  // Ctrl+molette hors photo gardent leur comportement navigateur.
  document.addEventListener('wheel', function(e) {
    if (!e.ctrlKey) return;
    if (isModalOpen) {
      if (dialog.contains(e.target)) e.preventDefault();
    } else if (e.deltaY < 0 && pinchZone(e)) {
      e.preventDefault();
      openZoomModal(true);
    }
  }, { passive: false, capture: true });

  // Safari (macOS touchpad, iOS) : événements propriétaires gesture*, e.scale = écartement cumulé
  // (1 = départ). Même seuil que le pinch tactile. Dans la modale, on bloque seulement le zoom de la page.
  document.addEventListener('gesturestart', function(e) {
    if (pinchZone(e) || (isModalOpen && dialog.contains(e.target))) e.preventDefault();
  }, { passive: false, capture: true });

  document.addEventListener('gesturechange', function(e) {
    if (isModalOpen) {
      if (dialog.contains(e.target)) e.preventDefault();
    } else if (pinchZone(e)) {
      e.preventDefault();
      if (e.scale >= PINCH_RATIO) openZoomModal(true);
    }
  }, { passive: false, capture: true });

  // --- Swipe horizontal sur la photo (tactile) : photo suivante / précédente ---
  // Le thème n'en fournit pas toujours (Darkroom ne charge pas de lib de swipe selon sa config).
  // Navigation via <link rel="next|prev"> de Piwigo. Passif : ne bloque jamais le touchstart.
  var swipeStart = null;

  document.addEventListener('touchstart', function(e) {
    swipeStart = (tapTarget(e) && e.touches.length === 1)
      ? { time: Date.now(), x: e.touches[0].clientX, y: e.touches[0].clientY }
      : null;
  }, { passive: true, capture: true });

  function swipeNavigate(t) {
    if (!swipeStart || window.innerWidth >= 768) return false;
    var dx = t.clientX - swipeStart.x;
    var dy = t.clientY - swipeStart.y;
    var fast = Date.now() - swipeStart.time < 700;
    swipeStart = null;
    if (!fast || Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.6) return false;
    var link = document.querySelector('link[rel="' + (dx < 0 ? 'next' : 'prev') + '"]');
    if (!link || !link.href) return false;
    window.location.href = link.href;
    return true;
  }

  document.addEventListener('touchend', function(e) {
    if (!tapTarget(e)) return;
    var t = e.changedTouches[0];
    if (swipeNavigate(t)) {
      lastTap = null;
      clearTimeout(pendingNav);
      return;
    }
    if (isSecondTap(t)) {
      lastTap = null;
      clearTimeout(pendingNav);
      e.stopImmediatePropagation();
      if (e.cancelable) e.preventDefault();
      openZoomModal(true);
    } else {
      lastTap = { time: Date.now(), x: t.clientX, y: t.clientY };
    }
  }, true);

  // --- Navigation avec le bouton retour du navigateur ---

  window.addEventListener('popstate', function() {
    if (window.location.hash === '#zoom' && !isModalOpen) {
      openZoomModal(false);
    } else if (window.location.hash !== '#zoom' && isModalOpen) {
      closeZoomModal(false);
    }
  });

  // Initialisation au chargement de la page
  if (imageElement.complete) {
    init();
  } else {
    imageElement.onload = init;
  }

  // Grise + et − quand l'échelle maxi / mini est atteinte
  function updateZoomButtons(w) {
    var c = w && w.content;
    if (!c || !zoomUpButton || !zoomDownButton) return;
    var eps = 0.001;
    zoomUpButton.disabled = c.currentScale >= c.maxScale - eps;
    zoomDownButton.disabled = c.currentScale <= c.minScale + eps;
  }

  function init() {
    wzoom = WZoom.create('#superzoom-content', {
      type: 'html',
      width: imageElement.naturalWidth,
      height: imageElement.naturalHeight,
      zoomOnClick: false,
      smoothTimeDrag: 0.1,
      maxScale: 5,
      // Appelé par la lib après chaque changement d'échelle (boutons, molette, pinch, reset)
      rescale: updateZoomButtons,
      onGrab: function () {
        document.getElementById('superzoom-viewport').classList.add('superzoom-grabbing');
      },
      onDrop: function () {
        document.getElementById('superzoom-viewport').classList.remove('superzoom-grabbing');
      },
    });

    zoomUpButton.addEventListener('click', function () {
      if (wzoom && typeof wzoom.zoomUp === 'function') {
        wzoom.zoomUp();
      }
    });

    zoomDownButton.addEventListener('click', function () {
      if (wzoom && typeof wzoom.zoomDown === 'function') {
        wzoom.zoomDown();
      }
    });

    window.addEventListener('resize', function () {
      if (wzoom && typeof wzoom.prepare === 'function') {
        wzoom.prepare();
      }
    });

    // Auto-ouverture si #zoom est présent dans l'URL au chargement
    if (window.location.hash === '#zoom') {
      setTimeout(function() {
        openZoomModal(false);
      }, 100);
    }
  }
});
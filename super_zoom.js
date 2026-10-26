document.addEventListener('DOMContentLoaded', function () {

  // Vérifie qu'on est sur thePicturePage via l'ID du body
  if (document.body.id !== "thePicturePage") return;

  // Modal
  const openButton = document.querySelector("#superzoom-btn-open");
  const closeButton = document.querySelector("#superzoom-btn-close");
  const dialog = document.querySelector(".superzoom-dialog");

  // WheelZoom
  var imageElement = document.getElementById('superzoom-content').querySelector('img');

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
          onGrab: function () {
            document.getElementById('superzoom-viewport').classList.add('superzoom-grabbing');
          },
          onDrop: function () {
            document.getElementById('superzoom-viewport').classList.remove('superzoom-grabbing');
          },
        });
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

  function openZoomModal(updateUrl) {
    if (isModalOpen) return;
    dialog.showModal();
    isModalOpen = true;
    fitDialog();
    updateModalImage();
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
  dialog.addEventListener('click', function(event) {
    if (event.target === dialog) {
      closeZoomModal(true);
    }
  });

  // Fermeture avec la touche Échap (événement natif du dialog)
  dialog.addEventListener('close', function() {
    if (isModalOpen) {
      isModalOpen = false;
      document.body.focus();
      removeZoomFromUrl();
    }
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
    if (!area || !lastTap || Date.now() - lastTap.time > 500) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    clearTimeout(pendingNav);
    pendingNav = setTimeout(function() { window.location.href = area.href; }, 380);
  }, true);

  document.addEventListener('touchend', function(e) {
    if (!tapTarget(e)) return;
    var t = e.changedTouches[0];
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

  function init() {
    wzoom = WZoom.create('#superzoom-content', {
      type: 'html',
      width: imageElement.naturalWidth,
      height: imageElement.naturalHeight,
      zoomOnClick: false,
      smoothTimeDrag: 0.1,
      maxScale: 5,
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
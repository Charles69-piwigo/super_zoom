document.addEventListener('DOMContentLoaded', function () {

  // Vérifie qu'on est sur thePicturePage via l'ID du body
  if (document.body.id !== "thePicturePage") return;

  // Modal
  const openButton = document.querySelector("#superzoom-btn-open");
  const closeButton = document.querySelector("#superzoom-btn-close");
  const dialog = document.querySelector(".superzoom-dialog");

  // WheelZoom
  var imageElement = document.getElementById('superzoom-content').querySelector('img');
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
            document.getElementById('superzoom-viewport').style.cursor = 'grabbing';
          },
          onDrop: function () {
            document.getElementById('superzoom-viewport').style.cursor = 'grab';
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
        document.getElementById('superzoom-viewport').style.cursor = 'grabbing';
      },
      onDrop: function () {
        document.getElementById('superzoom-viewport').style.cursor = 'grab';
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
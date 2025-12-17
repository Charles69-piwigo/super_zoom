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
  var wzoom;

  // Fonction pour obtenir l'URL de l'image à zoomer
// Fonction pour obtenir l'URL de l'image à zoomer
function getCurrentImageUrl() {
  //console.log("=== getCurrentImageUrl appelée ===");
  
  // Vérifier si on est sur le verso
  var versoPage = document.getElementById('theVersoImage');
  //console.log("Element theVersoImage:", versoPage);
  
  if (versoPage) {
    var displayStyle = window.getComputedStyle(versoPage).display;
    //console.log("Display du verso:", displayStyle);
    
    if (displayStyle !== 'none') {
      //console.log("Le verso est visible !");
      //console.log("window.jsUrlVersoSUPZ:", window.jsUrlVersoSUPZ);
      
      // On est sur le verso, utiliser l'URL originale du verso
      if (typeof window.jsUrlVersoSUPZ !== 'undefined') {
        //console.log("Retour URL verso:", window.jsUrlVersoSUPZ);
        return window.jsUrlVersoSUPZ;
      } else {
        //console.log("ERREUR: jsUrlVersoSUPZ non défini !");
      }
    } else {
      //console.log("Le verso n'est PAS visible");
    }
  } else {
    //console.log("Element theVersoImage introuvable");
  }
  
  // Par défaut, utiliser l'URL originale du recto
  //console.log("window.jsUrlSUPZ:", window.jsUrlSUPZ);
  if (typeof window.jsUrlSUPZ !== 'undefined') {
    //console.log("Retour URL recto:", window.jsUrlSUPZ);
    return window.jsUrlSUPZ;
  }
  
  // Fallback : retourner l'image actuellement dans le modal
  //console.log("Fallback - image du modal:", imageElement.src);
  return imageElement.src;
}

// Mettre à jour l'URL de l'image dans le modal
function updateModalImage() {
  var currentUrl = getCurrentImageUrl();
  var modalImg = document.getElementById('superzoom-content').querySelector('img');
  
  //console.log("updateModalImage - URL actuelle du modal:", modalImg.src);
  //console.log("updateModalImage - Nouvelle URL:", currentUrl);
  
  if (modalImg && modalImg.src !== currentUrl) {
    //console.log("Changement d'image détecté - Réinitialisation de WZoom");
    
    // Détruire l'ancienne instance de WZoom
    if (typeof wzoom !== 'undefined' && wzoom.destroy) {
      wzoom.destroy();
      //console.log("Ancienne instance WZoom détruite");
    }
    
    // Changer l'image
    modalImg.src = currentUrl;
    
    // Attendre que la nouvelle image soit chargée avant de recréer wzoom
    modalImg.onload = function() {
      //console.log("Nouvelle image chargée, dimensions:", modalImg.naturalWidth, "x", modalImg.naturalHeight);
      
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
      
      //console.log("Nouvelle instance WZoom créée");
    };
  } else {
    //console.log("Pas de changement d'image nécessaire");
  }
}

  // Event listeners pour le modal
  openButton.addEventListener("click", function() {
    dialog.showModal();
    updateModalImage();
  });
  
  closeButton.addEventListener("click", function() {
    dialog.close();
  });

  // Initialisation
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
      wzoom.zoomUp();
    });

    zoomDownButton.addEventListener('click', function () {
      wzoom.zoomDown();
    });

    window.addEventListener('resize', function () {
      wzoom.prepare();
    });

  }
});
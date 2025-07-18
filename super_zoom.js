document.addEventListener('DOMContentLoaded', function () {

  // Modal

  const openButton = document.querySelector("#superzoom-btn-open");
  const closeButton = document.querySelector("#superzoom-btn-close");
  const dialog = document.querySelector(".superzoom-dialog");

  openButton.addEventListener("click", () => {
      dialog.showModal();
  });

  closeButton.addEventListener("click", () => {
      dialog.close();
  });

  // WheelZoom
  var imageElement = document.getElementById('superzoom-content').querySelector('img');
  var zoomUpButton = document.querySelector('[data-zoom-up]');
  var zoomDownButton = document.querySelector('[data-zoom-down]');

  if (imageElement.complete) {
    init();
  } else {
    imageElement.onload = init;
  }

  function init() {

    var wzoom = WZoom.create('#superzoom-content', {
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
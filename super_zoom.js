document.addEventListener('DOMContentLoaded', function () {

  // Modal

  const openButton = document.querySelector("#openButton");
  const closeButton = document.querySelector("#closeButton");
  const dialog = document.querySelector("dialog");

  openButton.addEventListener("click", () => {
      dialog.showModal();
  });

  closeButton.addEventListener("click", () => {
      dialog.close();
  });

  // WheelZoom
  var imageElement = document.getElementById('myContent').querySelector('img');
  var zoomUpButton = document.querySelector('[data-zoom-up]');
  var zoomDownButton = document.querySelector('[data-zoom-down]');

  if (imageElement.complete) {
      init();
  } else {
      imageElement.onload = init;
  }

  function init() {

      var wzoom = WZoom.create('#myContent', {
          type: 'html',
          width: imageElement.naturalWidth,
          height: imageElement.naturalHeight,
          zoomOnClick: false,
          smoothTimeDrag: 0.1,
          maxScale: 5,
          onGrab: function () {
              document.getElementById('myViewport').style.cursor = 'grabbing';
          },
          onDrop: function () {
              document.getElementById('myViewport').style.cursor = 'grab';
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
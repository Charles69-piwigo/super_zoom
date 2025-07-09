<a id="zoom-btn" class="nav-link" title="Zoomer" rel="nofollow" onclick="openZoomPopup()">
  <img src="{$ROOT_URL}plugins/super_zoom/image/zoom.png" width="32" height="32" alt="Zoom">
</a>

<div id="zoom-popup" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:#000; z-index:9999; justify-content:center; align-items:center;">
  <img id="zoom-image" style="max-width:90vw; max-height:90vh; cursor:move;">
  <button onclick="closeZoomPopup()" style="position:absolute; top:10px; right:10px; font-size:24px;">✖</button>
</div>

<script>
function openZoomPopup() {
  const popup = document.getElementById("zoom-popup");
  const image = document.getElementById("zoom-image");

  // 🔽 utilise la variable JS définie dans super_zoom_url.tpl
  image.src = window.jsUrlSUPZ;

  popup.style.display = "flex";
  WheelZoom(image, { zoom: 0.1 });
}

function closeZoomPopup() {
  const popup = document.getElementById("zoom-popup");
  popup.style.display = "none";
}
</script>

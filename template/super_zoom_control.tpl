<button id="superzoom-btn-open" class="superzoom-btn-open">
  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24">
    <path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m20 20-5.05-5.05m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9ZM7 10h6m-3-3v6"/>
  </svg>
</button>

<dialog class="superzoom-dialog">
  <div class="superzoom-wrapper">
    <div id="superzoom-viewport" class="superzoom-viewport">
      <div id="superzoom-content" class="superzoom-content">
        <img src="{$IMG_URL_SUPZ}" alt="image"/>
      </div>
    </div>
  </div>
  <div class="superzoom-dialog-controls">
    <button data-zoom-down class="superzoom-dialog-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h12"/></svg>
    </button>
    <button data-zoom-up class="superzoom-dialog-btn">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h6m0 0h6m-6 0v6m0-6V6"/></svg>
    </button>
    <button id="superzoom-btn-close" class="superzoom-dialog-btn superzoom-btn-close">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" viewBox="0 0 24 24"><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 5 5 19M5 5l14 14"/></svg>
    </button>
  </div>
</dialog>
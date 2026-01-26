<div class="titrePage">
  <h2>Super Zoom - Configuration</h2>
</div>

<form method="post" action="" class="properties">
  <fieldset>
    <legend>Position du bouton loupe</legend>
    
    <p>Choisissez où afficher le bouton loupe sur vos photos :</p>
    
    <label>
      <input type="radio" name="button_position" value="photo" {if $BUTTON_POSITION == 'photo'}checked="checked"{/if}>
      <strong>En haut à droite de la photo</strong>
      <br>
      <span style="margin-left: 25px; color: #666;">
        Le bouton s'affiche à côté de l'image (position par défaut)
      </span>
    </label>
    
    <br><br>
    
    <label>
      <input type="radio" name="button_position" value="navbar" {if $BUTTON_POSITION == 'navbar'}checked="checked"{/if}>
      <strong>Dans la barre de navigation</strong>
      <br>
      <span style="margin-left: 25px; color: #666;">
        Le bouton s'affiche dans la barre d'outils de navigation (utile pour certains thèmes avec panneau latéral)
      </span>
    </label>
  </fieldset>
  
  <p>
    <input type="submit" name="submit" value="Enregistrer la configuration" class="submit">
  </p>
</form>

<style>
  .properties fieldset {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid #ccc;
    background: #f9f9f9;
  }
  
  .properties legend {
    font-weight: bold;
    padding: 0 10px;
  }
  
  .properties label {
    display: block;
    margin: 10px 0;
    cursor: pointer;
  }
  
  .properties input[type="radio"] {
    margin-right: 8px;
  }
</style>
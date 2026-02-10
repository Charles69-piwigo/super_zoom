<div class="titrePage">
  <h2>{'super_zoom_page_title'|translate}</h2>
</div>

<form method="post" action="" class="properties">
  <fieldset>
    <legend>{'super_zoom_button_position'|translate}</legend>
    
    <p>{'super_zoom_button_position_desc'|translate}</p>
    
    <label>
      <input type="radio" name="button_position" value="photo" {if $BUTTON_POSITION == 'photo'}checked="checked"{/if}>
      <strong>{'super_zoom_position_photo_title'|translate}</strong>
      <br>
      <span style="margin-left: 25px; color: #666;">
        {'super_zoom_position_photo_desc'|translate}
      </span>
    </label>
    
    <br><br>
    
    <label>
      <input type="radio" name="button_position" value="navbar" {if $BUTTON_POSITION == 'navbar'}checked="checked"{/if}>
      <strong>{'super_zoom_position_navbar_title'|translate}</strong>
      <br>
      <span style="margin-left: 25px; color: #666;">
        {'super_zoom_position_navbar_desc'|translate}
      </span>
    </label>
  </fieldset>
  
  <p>
    <p style="text-align: left; margin-left: 40px;">
      <input type="submit" name="submit" value="{'super_zoom_save_config'|translate}" class="submit">
    </p>    
  </p>
</form>

<form> </br>
<fieldset>
    <legend>{'feature_zoom'|translate}</legend>
    
    <p>{'feature_zoom_desc1'|translate}</p>
    <p>{'feature_zoom_desc2'|translate}</p>
    <p>{'feature_zoom_desc3'|translate}</p>
    <p>{'feature_zoom_desc4'|translate}</p>
    <p>{'feature_zoom_desc5'|translate}</p>
    

</fieldset>


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
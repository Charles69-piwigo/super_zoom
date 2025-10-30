<?php
/*
Plugin Name: super_zoom
Version: 1.6
Description: super_zoom permet de zoomer/dézoomer sur une image
Plugin URI: 
Author: Charles69
Author URI: 
*/

/*
 * Ce plugin Piwigo intègre la bibliothèque wheel-zoom.min.js
 * https://github.com/worka/vanilla-js-wheel-zoom
 * 
 * vanilla-js-wheel-zoom est distribué sous licence MIT © 2020 worka
 * Voir le fichier LICENSE pour plus de détails.
 */


 // ============  VERSIONS de SUPER_ZOOM =========================================================
 // historique des versions
 /*

 version 1.6 - 30/10/2025
      conflit avec filigrane, dans ce cas le zoom est fait sur la plus grandes des miniatures autorisées,
      si elle n'existe pas elle est créée

 version 1.5 - 11/10/2025
      désactivation du plugin sur mobile
      conflit avec photosphere, désactivation du plugin quand la photo est de type photosphere

 
 version 1.3 - 20/07/2025 - diffusion piwigo
      affichage de la loupe uniquement sur les images , pas sur les vidéos
      simplification du code php
 version 1.2 - 18/07/2025 - diffusion piwigo
      nettoyage du code , renommage des classes, corrigé position loupe + double ascenceur
  version 1.1 - 12/07/2025 (diffusion Piwigo) 
  version 1.0 - 09/07/2025 (beta)
  
  
 */

defined('PHPWG_ROOT_PATH') or die('Hacking attempt!');

if (basename(dirname(__FILE__)) != 'super_zoom') {
  add_event_handler('init', 'super_zoom_error');
  function super_zoom_error() {
    global $page;
    $page['errors'][] = 'le nom du répertoire est incorrect, désactiver le plugin et le renommer "super_zoom"';
  }
  return;
}

// Constantes plugin
define('ZOOM_DIR', basename(dirname(__FILE__)));
define('ZOOM_PATH', PHPWG_PLUGINS_PATH . ZOOM_DIR . '/');

// Chargement scripts JS et CSS dans le footer
add_event_handler('loc_begin_page_tail', 'super_zoom_link');
function super_zoom_link() {
  global $template;
  $template->append('footer_elements', '
    <script src="plugins/super_zoom/vanilla/wheel-zoom.min.js"></script>
    <script src="plugins/super_zoom/super_zoom.js"></script>
    <link rel="stylesheet" href="plugins/super_zoom/super_zoom.css" />
  ');
}


add_event_handler('loc_end_picture', 'super_zoom_prepare');

function super_zoom_prepare() {
  global $template, $picture;

  if (!isset($picture['current']['path'])) return;

  $url_picture = $picture['current']['path'];
  $mime_type = mime_content_type($url_picture);
  //echo "MIME TYPE" , $mime_type ;

  // Si ce n’est pas une image JPEG, on arrête là ********************************************
  $mime_liste = ['image/jpeg', 'image/png', 'image/webp'] ; // liste des mimes ok
  if (!in_array($mime_type, $mime_liste)) return;
  //if ($mime_type !== 'image/jpeg') return;
  
  // Si c'est une photosphere on arrête là // demande Katryne  09/2025 *********************
  // echo "photosphere" , $picture['current']['is_sphere'] ;
  //if ($picture['current']['is_sphere']) return;
  if (!empty($picture['current']['is_sphere'])) return;

  
  // TEST sur Filigrane watermark Activé -----------------------------------
  include_once(PHPWG_ROOT_PATH . 'admin/include/image.class.php');

  $derivative = $picture['current']['derivatives']['large'];

  $ref = new ReflectionClass($derivative);
  $prop = $ref->getProperty('params');
  $prop->setAccessible(true);
  $params = $prop->getValue($derivative);

  $use_watermark = false; // valeur par défaut

    if (!is_null($params) && property_exists($params, 'use_watermark')) {
      $use_watermark = $params->use_watermark;
    }

 
  /*
  echo '<pre>';
  var_dump($use_watermark);
  echo '</pre>';
 */




  // si l'option filigrane est activée on utilise la miniature la plus grande au lieu de l'original
  if ($use_watermark) {
    include_once(PHPWG_ROOT_PATH . 'include/derivative.inc.php');
    include_once(PHPWG_ROOT_PATH . 'include/derivative_std_params.inc.php');

    $params = ImageStdParams::get_by_type(IMG_XXLARGE);
    $src = $picture['current']['src_image'];
    $derivative = new DerivativeImage($params, $src);
    $url_zoom = $derivative->get_url();
    $url_base = get_absolute_root_url();
    $url_relative = substr($url_picture, 2);
    $url_original = $url_base . $url_zoom;
    //echo 'filigrane ',$url_original ;

  } else {

      // URL absolue de l’image
    $url_base = get_absolute_root_url();
    $url_relative = substr($url_picture, 2);
    $url_original = $url_base . $url_relative;
    //echo 'originale ',$url_original ;

  }

  // Assignation Smarty
  $template->assign('IMG_URL_SUPZ', $url_original);
  $template->assign('MIME_TYPE_SUPZ', $mime_type);

  // Bouton de zoom
  $template->set_filename('zoomcontrol', ZOOM_PATH . 'template/super_zoom_control.tpl');
  $template->assign('BT_SUPZ', $template->parse('zoomcontrol', true));

  // Insertion du bouton via prefilter
  $template->set_prefilter('picture', 'addButton_superzoom');

  // JS à insérer dans le footer
  $template->set_filenames(['zoom_footer' => realpath(ZOOM_PATH . 'template/super_zoom_url.tpl')]);
  ob_start();
  $template->parse('zoom_footer');
  $footer_content = ob_get_clean();
  $template->append('footer_elements', $footer_content);
  
}



function addButton_superzoom($content) {
  $search = '{$ELEMENT_CONTENT}';
  $replacement = '<div class="superzoom"><div class="superzoom-container">{$ELEMENT_CONTENT}{$BT_SUPZ}</div>';
  return str_replace($search, $replacement, $content);
}
?>

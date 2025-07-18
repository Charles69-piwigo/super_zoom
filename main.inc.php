<?php
/*
Plugin Name: super_zoom
Version: 1.2
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

// Hook principal : analyse image et assignation des variables
add_event_handler('loc_end_picture', 'super_zoom_url');
function super_zoom_url() {
  global $template, $picture;

  if (!isset($picture['current']['path'])) {
    return;
  }

  // Construction de l’URL absolue de l’image
  $url_base = get_absolute_root_url();              // ex: https://mon.site/photo/
  $url_picture = $picture['current']['path'];       // ./upload/...
  $url_relative = substr($url_picture, 2);          // enleve './'
  $url_original = $url_base . $url_relative;        // URL absolue

  // Mime type
  $mime_type = mime_content_type($url_picture);

  // Si ce n’est pas une vidéo
  if ($mime_type !== 'video/mp4') {
    // Assignation Smarty
    $template->assign('IMG_URL_SUPZ', $url_original);
    $template->assign('MIME_TYPE_SUPZ', $mime_type);

 } else {
    $template->assign('IMG_URL_SUPZ', ZOOM_PATH . 'image/pas_de_zoom.jpg');
    $template->assign('MIME_TYPE_SUPZ', $mime_type);  
 } 
    // ➕ Génération du bloc bouton ZOOM ici
    $template->set_filename('zoomcontrol', ZOOM_PATH . 'template/super_zoom_control.tpl');
    $template->assign('BT_SUPZ', $template->parse('zoomcontrol', true));
  

  // ➕ Génération des variables JS dans le footer
  $template->set_filenames(array('zoom_footer' => realpath(ZOOM_PATH . 'template/super_zoom_url.tpl')));
  ob_start();
  $template->parse('zoom_footer');
  $footer_content = ob_get_clean();
  $template->append('footer_elements', $footer_content);
}

// Ajout du bouton ZOOM dans la page picture.tpl (dans la balise contenant l’image)
add_event_handler('loc_begin_picture', 'ajouter_superzoomcontrol');
function ajouter_superzoomcontrol() {
  global $template;
  // Pas besoin de générer ici le template : il a été assigné dans loc_end_picture
  // Il suffit d’insérer {$BT_SUPZ} dans le HTML
  $template->set_prefilter('picture', 'addButton_superzoom');
}

function addButton_superzoom($content) {
  $search = '{$ELEMENT_CONTENT}';
  $replacement = '<div class="superzoom"><div class="superzoom-container">{$ELEMENT_CONTENT}{$BT_SUPZ}</div>';
  return str_replace($search, $replacement, $content);
}
?>

<?php
/*
Plugin Name: super_zoom
Version: auto
Description: super_zoom permet de zoomer/dézoomer sur une image
Plugin URI: https://piwigo.org/ext/extension_view.php?eid=1039
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

 /*
 // ============  VERSIONS de SUPER_ZOOM =========================================================
 // historique des versions
 version 2.5 - 31/10/2026
      regroupement des versions v2.4.1 à v2.4.12
      pour publication sur PEM
      
 version 2.4.12 - 30/10/2026
      mobile : double tap dans la modale pour la fermer (hors boutons), sans clic parasite sur la photo en dessous
      PC : double tap au touchpad (ou double clic) dans la modale pour la fermer
      iPhone : touch-action: manipulation sur la photo, pour que Safari iOS ne garde pas le double tap pour son zoom natif (double tap qui n'ouvrait plus la modale)
      iPhone : la modale ouverte par double tap se refermait aussitôt (clic / dblclick synthétisé retombant sur la modale) ; délais anti-rebond à l'ouverture
      Mac / Safari : pinch au touchpad (événements gesture*) sur la photo pour ouvrir le zoom
      PC : double tap au touchpad (ou double clic) sur la photo pour ouvrir le zoom ; le clic simple sur les zones précédent/album/suivant de la photo est différé de 350 ms pour laisser passer le 2e clic

 version 2.4.11 - 30/10/2026
      PC : pinch au touchpad (molette + Ctrl, écartement) sur la photo pour ouvrir le zoom au lieu de zoomer la page ; dans la modale le pinch ne zoome plus la page

 version 2.4.10 - 30/10/2026
      mobile : écartement à deux doigts (pinch) sur la photo pour ouvrir le zoom, comme Google Photos ; le double tap reste actif

 version 2.4.9 - 30/10/2026
      boutons + et - grisés (désactivés) quand le zoom maxi / mini est atteint, quel que soit le moyen de zoom (boutons, molette, pinch)

 version 2.4.8 - 30/10/2026
      iPhone : taps rapides sur + / - ne déclenchent plus le zoom natif de la page (touch-action: manipulation) et ne ferment plus la modale (fermeture au clic sur le fond seulement si le geste y a commencé)

 version 2.4.7 - 30/10/2026
      mobile : swipe horizontal sur la photo (< 768px, modale fermée) pour passer à la photo suivante / précédente, via <link rel="next|prev"> ; le thème Darkroom n'en fournit pas selon sa config

 version 2.4.6 - 30/10/2026
      mobile (Darkroom) : le titre du site (.navbar-brand, nowrap) débordait de l'écran et faisait glisser la page avec une bande blanche à droite ; il passe maintenant à la ligne (< 768px), sur toutes les pages (album compris) et pas seulement la page photo
      CSS et JS du plugin chargés avec ?v=<date du fichier> : les mobiles ne gardent plus une ancienne version en cache

 version 2.4.5 - 29/10/2026
      correctif : plus d'erreur JS « Cannot read properties of null » sur une vidéo (modale non rendue côté PHP, le script se retire proprement)

 version 2.4.4 - 26/10/2026
      mobile : double tap fiabilisé sur Firefox Android et Safari iOS (le 2e tap est intercepté avant PhotoSwipe de Darkroom, qui s'ouvrait aléatoirement)
      mobile : le clic du 1er tap sur l'image map de Piwigo (zones photo précédente/suivante) est différé de 380 ms, pour ne plus changer de photo avant le 2e tap
      mobile : zones tactiles précédent / album / suivant du thème remises à l'échelle de la photo affichée (elles débordaient quand l'image est réduite)

 version 2.4.3 - 25/10/2026
      mobile : double tap sur la photo pour ouvrir le zoom (loupe masquée), à la place de PhotoSwipe (Bootstrap Darkroom)
      mobile : glisser dans le zoom ne change plus de photo ; modale ajustée à l'écran ; plus de bande blanche à la fermeture

 version 2.4.2 - 30/09/2026
      CSS chargé dans le head : supprime l'apparition furtive du cadre de la loupe

 version 2.4.1 - 30/09/2026
      loupe sur la photo décalée de 5 px vers le bas

 version 2.4 - 22/06/2026
      conformation au standard get_original_url

 version 2.3 - 20/06/2026
      corrigé bug avec photosphere / photosphere prioritaire
 
 version 2.2 - 19/06/2026
      corrigé bug avec le bouton loupe dans la barre d'outils
      corrigé bug avec redirection url
      corrigé warning avec filigrane

 version 2.1 - 10/02/2026
      url avec #zoom ouvre la modale
      mode d'emploi, fonctionnalité
      
 version 2.0a - 08/02/2026 test
      url avec #zoom ouvre la modale

 version 2.0 - 28/01/2026
      ajout page de configuration pour choisir la position du bouton loupe
      soit sur la photo , soit sur la barre de navigation
      testé avec bootstrap_darkroom, modus et elegant
      
 version 1.8a 1.8b - 23/01/2026
      corrigé erreurs js - les flèches fonctionnent  
      
 version 1.8 - 20/01/2026
      corrigé : déplacement dans l'album avec les flèches ( pb de focus sur la loupe )

 version 1.7 - 17/12/2025
      prise en compte du plugin Back2Front

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

//-----------------------------------------------------------------------------------
// Constantes plugin
define('ZOOM_DIR', basename(dirname(__FILE__)));
define('ZOOM_PATH', PHPWG_PLUGINS_PATH . ZOOM_DIR . '/');

//===================== CHARGEMENT DES LANGUES , UK PAR DEFAUT ==================
load_language('plugin.lang', ZOOM_PATH, array('language' => 'en_UK', 'no_fallback' => true));
load_language('plugin.lang', ZOOM_PATH);
//===========================================================================

//---------------------------------------------------------------------------------
// Logs  --- à activer pour débugage
//error_reporting(E_ALL);
//ini_set('display_errors', 0);
//ini_set('log_errors', 1);
//ini_set('error_log', './plugins/super_zoom/super_zoom_debug.log');
//error_log('-------- DEBUT DEBUG -----------');

//-----------------------------------------------------------------------------------
// Ajout du lien dans le menu admin
add_event_handler('get_admin_plugin_menu_links', 'super_zoom_admin_menu');
function super_zoom_admin_menu($menu) {
  $menu[] = array(
    'NAME' => 'Super Zoom',
    'URL'  => get_root_url() . 'admin.php?page=plugin-' . ZOOM_DIR
  );
  return $menu;
}

//----------------------------------------------------------------------------------
// Chargement du CSS dans le <head> : chargé dans le footer, le bouton loupe
// s'affichait brièvement sans style à droite de la photo
add_event_handler('loc_begin_page_header', 'super_zoom_css');

function super_zoom_css() {
  global $template;

  $root = get_absolute_root_url();
  $template->append('head_elements', '<link rel="stylesheet" href="' . $root . 'plugins/super_zoom/super_zoom.css?v=' . @filemtime(__DIR__ . '/super_zoom.css') . '" />');
}

//----------------------------------------------------------------------------------
// Chargement scripts JS dans le footer
add_event_handler('loc_begin_page_tail', 'super_zoom_link');

function super_zoom_link() {
  global $template, $conf;

  $super_zoom_config = isset($conf['super_zoom_config']) ? safe_unserialize($conf['super_zoom_config']) : array('button_position' => 'photo');
  $button_position = isset($super_zoom_config['button_position']) ? $super_zoom_config['button_position'] : 'photo';
  
  $root = get_absolute_root_url();
  $template->append('footer_elements', '
    <script src="' . $root . 'plugins/super_zoom/vanilla/wheel-zoom.min.js"></script>
    <script src="' . $root . 'plugins/super_zoom/super_zoom.js?v=' . @filemtime(__DIR__ . '/super_zoom.js') . '"></script>
    <script>
      window.superZoomButtonPosition = "' . $button_position . '";
    </script>
  ');
}

//--------------------------------------------------------------------------------
add_event_handler('loc_end_picture', 'super_zoom_prepare');

function super_zoom_prepare() {
  global $template, $picture, $prefixeTable, $conf;


  if (!isset($picture['current']['path'])) return;

  $url_picture = $picture['current']['path'];
  $mime_type = mime_content_type($url_picture);

  // Si ce n'est pas une image JPEG, on arrête là 
  $mime_liste = ['image/jpeg', 'image/png', 'image/webp'];
  if (!in_array($mime_type, $mime_liste)) return;
  
  // ==================  PLUGIN PHOTOSPHERE =======================
  // Si c'est une photosphere on arrête là 
  if (!empty($picture['current']['is_sphere'])) return;

  // ==================  OPTION FILIGRANE =========================
  // TEST sur Filigrane watermark Activé
  include_once(PHPWG_ROOT_PATH . 'admin/include/image.class.php');

  $derivative = $picture['current']['derivatives']['large'];

  if (is_null($derivative)) return;

  $use_watermark = false;

  try {
    $ref = new ReflectionClass($derivative);
    $prop = $ref->getProperty('params');
    $params = $prop->getValue($derivative);

    if (!is_null($params) && property_exists($params, 'use_watermark')) {
      $use_watermark = $params->use_watermark;
    }
  } catch (Exception $e) {
    // dérivative non accessible, on continue sans filigrane
  }

  // si l'option filigrane est activée on utilise la miniature la plus grande au lieu de l'original
  if ($use_watermark) {
    include_once(PHPWG_ROOT_PATH . 'include/derivative.inc.php');
    include_once(PHPWG_ROOT_PATH . 'include/derivative_std_params.inc.php');

    $params = ImageStdParams::get_by_type(IMG_XXLARGE);
    $src = $picture['current']['src_image'];
    $derivative = new DerivativeImage($params, $src);
    $url_zoom = $derivative->get_url();
    $url_base = get_absolute_root_url();
    $url_original = $url_base . $url_zoom;
  } else {
    // URL absolue de l'image originale
// trigger_change permet à d'autres plugins d'intercepter l'URL
    // (ex: private_derivative_protection pour les albums privés)
    $url_base = get_absolute_root_url();
    $url_relative = substr($url_picture, 2);
    $src_image = $picture['current']['src_image'];
    $url_original = trigger_change('get_original_url', $url_base . $url_relative, $src_image);
  }

  //================= PLUGIN BACK2FRONT ===============================
  
  // Assignation Smarty pour le RECTO
  $template->assign('IMG_URL_SUPZ', $url_original);
  $template->assign('MIME_TYPE_SUPZ', $mime_type);

  $b2f_table = $prefixeTable . 'image_verso';
  $query_check = "SHOW TABLES LIKE '" . $b2f_table . "'";
  $result_check = pwg_query($query_check);
  
  if (pwg_db_num_rows($result_check) > 0) {
    $query = '
        SELECT i.id, i.path
          FROM ' . IMAGES_TABLE . ' as i
            INNER JOIN ' . $b2f_table . ' as v
            ON i.id = v.verso_id
            AND v.image_id = ' . $picture['current']['id'] . '
        ;';
    
    $result = pwg_query($query);
    
    if (pwg_db_num_rows($result) > 0) {
      $verso = pwg_db_fetch_assoc($result);
      
      if ($use_watermark) {
        include_once(PHPWG_ROOT_PATH . 'include/derivative.inc.php');
        include_once(PHPWG_ROOT_PATH . 'include/derivative_std_params.inc.php');
        
        $params = ImageStdParams::get_by_type(IMG_XXLARGE);
        $verso_src = new SrcImage($verso);
        $derivative = new DerivativeImage($params, $verso_src);
        $url_verso = $derivative->get_url();
        $url_base = get_absolute_root_url();
        $url_verso_full = $url_base . $url_verso;
      } else {

        // trigger_change permet à d'autres plugins d'intercepter l'URL du verso
        include_once(PHPWG_ROOT_PATH . 'include/derivative.inc.php');
        $url_base = get_absolute_root_url();
        $url_relative = substr($verso['path'], 2);
        $verso_src = new SrcImage($verso);
        $url_verso_full = trigger_change('get_original_url', $url_base . $url_relative, $verso_src);
      }
      
      $template->append('footer_elements', '
  <script>
    window.jsUrlVersoSUPZ = "' . $url_verso_full . '";
  </script>
  ');
    }
  }
  // --------------------- fin traitement des plugins ----------------------------

  // =============  GESTION DE LA POSITION DU BOUTON LOUPE =============================

  $super_zoom_config = isset($conf['super_zoom_config']) ? safe_unserialize($conf['super_zoom_config']) : array('button_position' => 'photo');
  $button_position = isset($super_zoom_config['button_position']) ? $super_zoom_config['button_position'] : 'photo';
  
  //error_log('Position du bouton : ' . $button_position);
  
  // Parser le template du bouton + la modale
  $template->set_filename('zoomcontrol', ZOOM_PATH . 'template/super_zoom_control.tpl');
  $button_and_modal = $template->parse('zoomcontrol', true);


 if ($button_position == 'navbar') {
    // ============= MODE NAVBAR =============
    //error_log('=== MODE NAVBAR : DEBUT ===');
    
    // Parser le template du BOUTON navbar
    $template->set_filename('zoom_navbar_btn', ZOOM_PATH . 'template/super_zoom_navbar.tpl');
    $navbar_button = $template->parse('zoom_navbar_btn', true);
    
    // Parser le template de la MODALE
    $template->assign('BUTTON_POSITION', $button_position);
    $template->set_filename('zoomcontrol', ZOOM_PATH . 'template/super_zoom_control.tpl');
    $modal_only = $template->parse('zoomcontrol', true);
    
    // Injecter le bouton dans la navbar photo
    $template->concat('PLUGIN_PICTURE_ACTIONS', $navbar_button);
    
    // Ajouter la modale dans le footer
    $template->append('footer_elements', $modal_only);
    
    //error_log('=== MODE NAVBAR : FIN ===');
    
} else {
    // ============= MODE PHOTO =============
    //error_log('MODE PHOTO : Utilisation du prefilter');
    
    $template->assign('BUTTON_POSITION', $button_position);
    $template->set_filename('zoomcontrol', ZOOM_PATH . 'template/super_zoom_control.tpl');
    $button_and_modal = $template->parse('zoomcontrol', true);
    
    $template->assign('BT_SUPZ', $button_and_modal);
    $template->set_prefilter('picture', 'addButton_superzoom');
}


  // JS à insérer dans le footer ----------------------------------------

  $template->set_filenames(['zoom_footer' => realpath(ZOOM_PATH . 'template/super_zoom_url.tpl')]);
  ob_start();
  $template->parse('zoom_footer');
  $footer_content = ob_get_clean();
  $template->append('footer_elements', $footer_content);
}
//========== fin event_handler loc_end_picture =============================================

function addButton_superzoom($content) {
  $search = '{$ELEMENT_CONTENT}';
  $replacement = '<div class="superzoom"><div class="superzoom-container">{$ELEMENT_CONTENT}{$BT_SUPZ}</div></div>';
  return str_replace($search, $replacement, $content);
}

//------------------------------------------------------------------------------
?>
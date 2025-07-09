<?php
/*
Plugin Name: super_zoom
Version: 1.0
Description: super_zoom permet de zoomer sur une image
Plugin URI: 
Author: Charles69
Author URI: 
*/


 // ============  VERSIONS =========================================================
 // historique des versions
 /*

  version 1.0 - 09/07/2025 (beta)
  
  
 */

defined('PHPWG_ROOT_PATH') or die('Hacking attempt!');

if (basename(dirname(__FILE__)) != 'super_zoom')
{
  add_event_handler('init', 'super_zoom_error');
  function super_zoom_error()
  {
    global $page;
    $page['errors'][] = 'le nom du répertoire est incorrect, désactiver le plugin et le renommer  "super_zoom"';
  }
  return;
}

// +-----------------------------------------------------------------------+
// | Define plugin constants                                               |
// +-----------------------------------------------------------------------+

define('ZOOM_DIR',    basename(dirname(__FILE__)));
define('ZOOM_PATH' , PHPWG_PLUGINS_PATH . ZOOM_DIR . '/');

//echo ' ZOOM_PATH= ' , ZOOM_PATH ;
//echo ' ZOOM_DIR= ' , ZOOM_DIR ;

// SCRIPT =======================================================================================
// ajoute les scripts et CSS

add_event_handler('loc_begin_page_tail', 'super_zoom_link');
function super_zoom_link()
{
    global $page, $template;
    //print_r($page) ;
    
    $template->append('footer_elements', '
    <script src="plugins/super_zoom/vanilla/wheel-zoom.min.js"></script>
    <script src="plugins/super_zoom/super_zoom.js"></script>
    <link rel="stylesheet" href="plugins/super_zoom/super_zoom.css" />
    ');
    
}



//===================================================================================
//   IDENTIFICATION PHOTO/VIDEO - Récupération de l'URL et du MIME
/// on est dans une page qui contient une photo  ou une video * loc_end_picture *

//==================================================================================
// Récupération de l'URL et du MIME TYPE
add_event_handler('loc_end_picture','super_zoom_url') ; 

function super_zoom_url() {

  //echo('picture');
  
  global $template, $picture;
    
    if (!isset($picture['current']['path'])) {
        return;
    }

    // Récupérer l'URL de base  ==============
    $url_base = get_absolute_root_url();            // renvoie https://robert .. /photo.charles/
    //echo $url_base ;
    $url_picture = $picture['current']['path'];     // débute par ./
    $url_picture2 = substr($url_picture,2);         // enlève ./ au début
    $url_original = $url_base . $url_picture2;      // url https de la photo originale
    //echo '  url orig= ' , $url_original ;
    
    // Récupération du Mime Type ==============
    //echo gettype($url_picture) ;
    $mime_type = mime_content_type($url_picture) ;
    //echo 'mime type= ' , $mime_type;

    //if (substr($url_original,-3) !== 'mp4') {    // ce n'est pas une vidéo
    if ($mime_type !== 'video/mp4') {    // ce n'est pas une vidéo

            // Assigner à Smarty
            //$url_original = json_encode($url_original);
            $template->assign('IMG_URL_SUPZ', $url_original); // Assignation dans le template
            $template->assign('MIME_TYPE_SUPZ', $mime_type);  // assignation dans le template
            //echo 'assignation ok';
            //echo $url_original ;
    }      
  }


// ==========================================================================================
// Création des variables JS  -  JSUrl et JSMime à partir des assignations

add_event_handler('loc_end_picture', 'SuperZoomAddVariables');

function SuperZoomAddVariables()  {
    global $page, $template;
    
    // Charger le template
    $template->set_filenames(array('zoom_footer' => realpath(PHPWG_PLUGINS_PATH . 'super_zoom/template/super_zoom_url.tpl')));

    // Capturer le rendu du template
    ob_start();
    $template->parse('zoom_footer');
    $footer_content = ob_get_clean(); // Capture le HTML généré

    // Ajouter ce contenu dans footer_elements
    $template->append('footer_elements', $footer_content);
}

// -----------------------------------------------------------------------------------------------


// Ajout du bouton ZOOM à coté de l'image

add_event_handler('loc_begin_picture', 'ajouter_superzoomcontrol');

function ajouter_superzoomcontrol() {



    global $template;
    $template->set_filename('zoomcontrol', ZOOM_PATH.'template/super_zoom_control.tpl',15);
    $template->assign('BT_SUPZ', $template->parse('zoomcontrol', true));
    // Enregistrement du pré-filtre pour modifier le template
    $template->set_prefilter('picture', 'addButton_superzoom');
}


function addButton_superzoom($content) {


    $search = '{$ELEMENT_CONTENT}';  // éléments Image dans picture.tpl
    //$replacement = '{$ELEMENT_CONTENT}{$BT_SUPZ}';  // place le bouton à coté de l'image
    $replacement = '{$ELEMENT_CONTENT}' 
                 . '<div class="image-container" style="position:relative; display:inline-block;">' 
                 . '{$BT_SUPZ}' 
                 . '</div>';
    return str_replace($search, $replacement, $content);
}


?>

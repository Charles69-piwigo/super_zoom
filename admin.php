<?php
defined('PHPWG_ROOT_PATH') or die('Hacking attempt!');

// Chargement de la langue (pour les futurs textes traduits)
load_language('plugin.lang', ZOOM_PATH);

// Récupération de la configuration actuelle
global $conf;
$super_zoom_config = isset($conf['super_zoom_config']) ? safe_unserialize($conf['super_zoom_config']) : array();

// Valeur par défaut si la config n'existe pas
if (empty($super_zoom_config)) {
  $super_zoom_config = array(
    'button_position' => 'photo'
  );
}

// Sauvegarde de la configuration
if (isset($_POST['submit'])) {
  $super_zoom_config['button_position'] = $_POST['button_position'];
  
  conf_update_param('super_zoom_config', serialize($super_zoom_config));
  
  $page['infos'][] = 'Configuration enregistrée';
}

// Assignation au template
$template->assign(array(
  'BUTTON_POSITION' => $super_zoom_config['button_position'],
  'ADMIN_PAGE_TITLE' => 'Super Zoom - Configuration',
));

// Définition du template
$template->set_filename('super_zoom_admin', realpath(ZOOM_PATH . 'template/admin.tpl'));
$template->assign_var_from_handle('ADMIN_CONTENT', 'super_zoom_admin');
?>
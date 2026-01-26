<?php
defined('PHPWG_ROOT_PATH') or die('Hacking attempt!');

function plugin_install() {
  // Configuration par défaut : bouton sur la photo
  $default_config = array(
    'button_position' => 'photo'
  );
  
  conf_update_param('super_zoom_config', serialize($default_config));
}

function plugin_activate() {
  // Vérifier si la config existe déjà, sinon créer les valeurs par défaut
  global $conf;
  
  if (!isset($conf['super_zoom_config'])) {
    $default_config = array(
      'button_position' => 'photo'
    );
    conf_update_param('super_zoom_config', serialize($default_config));
  }
}

function plugin_deactivate() {
  // On garde la config même si le plugin est désactivé
}

function plugin_uninstall() {
  // Suppression de la configuration lors de la désinstallation
  conf_delete_param('super_zoom_config');
}
?>
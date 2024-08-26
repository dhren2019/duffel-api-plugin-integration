<?php
/**
 * Plugin Name: Duffel API Flight Search Integration
 * Description: A plugin to integrate Duffel's API for flight search in WordPress using React.
 * Version: 1.0.0
 * Author: Tu Nombre
 */

// Evita que se acceda directamente al archivo.
if (!defined('ABSPATH')) exit;

// Carga los archivos necesarios
require_once plugin_dir_path(__FILE__) . 'includes/settings.php';
require_once plugin_dir_path(__FILE__) . 'includes/api-functions.php';

// Función para cargar scripts y estilos
function duffel_enqueue_assets() {
    // Carga los estilos
    wp_enqueue_style('duffel-styles', plugins_url('includes/css/duffel-styles.css', __FILE__));

    // Carga el código JavaScript de React para manejar la interacción con la API y el frontend
    wp_enqueue_script(
        'duffel-react-bundle',
        plugins_url('includes/js/duffel-react-bundle.js', __FILE__),
        ['wp-element'], // wp-element ya incluye React y ReactDOM
        null,
        true
    );
}
add_action('wp_enqueue_scripts', 'duffel_enqueue_assets');

// Crear un shortcode para mostrar el formulario de búsqueda
function duffel_flight_search_shortcode() {
    return '<div id="duffel-flight-search"></div>';
}
add_shortcode('duffel_flight_search', 'duffel_flight_search_shortcode');

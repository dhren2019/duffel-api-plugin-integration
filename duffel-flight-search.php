<?php
/**
 * Plugin Name: Duffel API Integration
 * Description: Integración con la API de Duffel para buscar vuelos.
 * Version: 1.0
 * Author: TuNombre
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Incluir archivos necesarios
include_once plugin_dir_path(__FILE__) . 'settings.php';
include_once plugin_dir_path(__FILE__) . 'includes/api-functions.php';

// Registrar el shortcode
add_shortcode('duffel_search_flights', 'duffel_search_flights_shortcode');

// Encolar el archivo CSS y JS
function duffel_search_flights_enqueue_assets() {
    wp_enqueue_style('duffel-styles', plugin_dir_url(__FILE__) . 'includes/css/duffel-styles.css');
    wp_enqueue_script('duffel-scripts', plugin_dir_url(__FILE__) . 'includes/js/duffel-scripts.js', array('jquery'), null, true);
    wp_localize_script('duffel-scripts', 'ajaxurl', admin_url('admin-ajax.php'));
    
    // Añade este script en línea para verificar la carga del archivo CSS
    wp_add_inline_script('duffel-scripts', 'console.log("CSS de Duffel cargado correctamente.");');
}
add_action('wp_enqueue_scripts', 'duffel_search_flights_enqueue_assets');


// Definir el shortcode
function duffel_search_flights_shortcode($atts) {
    ob_start();
    ?>
 <div id="duffel-flight-search">
    <!-- Paso 1: Selección del tipo de viaje -->
    <div id="step-1" class="step active">
        <h2>Selecciona el tipo de viaje</h2>
        <form id="search-form" class="duffel-search-form" method="POST">
            <!-- Campos del formulario existentes -->
            <?php wp_nonce_field('duffel_search_flights_action', 'duffel_search_flights_nonce'); ?>
            
            <div class="form-group">
                <label for="trip_type">Tipo de Viaje:</label>
                <select name="trip_type" id="trip_type">
                    <option value="oneway">Solo Ida</option>
                    <option value="return">Ida y Vuelta</option>
                </select>
            </div>

            <div class="form-group">
                <label for="origin">Origen:</label>
                <input type="text" name="origin" id="origin" placeholder="LHR (London Heathrow) o Londres" required>
            </div>

            <div class="form-group">
                <label for="destination">Destino:</label>
                <input type="text" name="destination" id="destination" placeholder="JFK (John F Kennedy) o Nueva York" required>
            </div>

            <div class="form-group">
                <label for="departure_date">Fecha Ida:</label>
                <input type="date" name="departure_date" id="departure_date" required>
            </div>

            <div class="form-group return-date-group" id="return-date-group" style="display: none;">
                <label for="return_date">Fecha Vuelta:</label>
                <input type="date" name="return_date" id="return_date">
            </div>

            <div class="form-group">
                <label for="passengers">Pasajeros:</label>
                <input type="number" name="passengers" id="passengers" value="1" min="1">
            </div>

            <button type="button" id="next-to-step-2">Buscar Vuelos</button>
        </form>
    </div>

    <!-- Paso 2: Selección del vuelo de ida -->
    <div id="step-2" class="step">
        <h2>Selecciona tu vuelo de ida</h2>
        <div id="outbound-flights">
            <!-- Aquí se cargarán las tarjetas de los vuelos de ida -->
        </div>
        <button type="button" id="next-to-step-3" style="display:none;">Siguiente</button>
    </div>

    <!-- Paso 3: Selección del vuelo de vuelta -->
    <div id="step-3" class="step">
        <h2>Selecciona tu vuelo de vuelta</h2>
        <div id="return-flights">
            <!-- Aquí se cargarán las tarjetas de los vuelos de vuelta -->
        </div>
        <button type="submit" id="submit-form">Enviar</button>
    </div>
</div>

    <?php return ob_get_clean();
}
add_shortcode('duffel_search_flights', 'duffel_search_flights_shortcode');

// Manejar la solicitud AJAX para buscar vuelos
add_action('wp_ajax_duffel_search_flights', 'duffel_search_flights_ajax_handler');
add_action('wp_ajax_nopriv_duffel_search_flights', 'duffel_search_flights_ajax_handler');

function duffel_search_flights_ajax_handler() {
    if (!isset($_GET['origin']) || !isset($_GET['destination']) || !isset($_GET['departure_date'])) {
        wp_send_json_error('Missing parameters');
        return;
    }

    $origin = sanitize_text_field($_GET['origin']);
    $destination = sanitize_text_field($_GET['destination']);
    $departure_date = sanitize_text_field($_GET['departure_date']);
    $return_date = isset($_GET['return_date']) ? sanitize_text_field($_GET['return_date']) : null;

    $flights = duffel_search_flights($origin, $destination, $departure_date, $return_date);

    if (!empty($flights)) {
        wp_send_json($flights);
    } else {
        wp_send_json([]);
    }
}
?>

<?php
/**
 * Plugin Name: Duffel API Integration
 * Description: Integración con la API de Duffel para buscar vuelos.
 * Version: 1.1
 * Author: Dhren
 */


 if (!defined('ABSPATH')) {
     exit; // Exit if accessed directly.
 }
 
 if (!function_exists('duffel_search_flights')) {
     function duffel_search_flights($origin, $destination, $departure_date, $return_date = null) {
         $api_key = get_option('duffel_api_key');
         $url = 'https://api.duffel.com/air/offer_requests';
 
         $data = [
             "data" => [
                 "slices" => [
                     [
                         "origin" => $origin,
                         "destination" => $destination,
                         "departure_date" => $departure_date
                     ]
                 ],
                 "passengers" => [
                     [
                         "type" => "adult"
                     ]
                 ],
                 "cabin_class" => "economy"
             ]
         ];
 
         if ($return_date) {
             $data["data"]["slices"][] = [
                 "origin" => $destination,
                 "destination" => $origin,
                 "departure_date" => $return_date
             ];
         }
 
         $response = wp_remote_post($url, [
             'method' => 'POST',
             'headers' => [
                 'Authorization' => 'Bearer ' . $api_key,
                 'Duffel-Version' => 'v1',
                 'Content-Type' => 'application/json'
             ],
             'timeout' => 15,
             'body' => wp_json_encode($data)
         ]);
 
         if (is_wp_error($response)) {
             error_log('Error in API request: ' . $response->get_error_message());
             return ['error' => 'Error in API request: ' . $response->get_error_message()];
         }
 
         $body = wp_remote_retrieve_body($response);
         error_log('API Response Body: ' . $body);  // Registro del cuerpo de la respuesta
         $result = json_decode($body, true);
 
         if ($result === null) {
             error_log('Error parsing JSON response: ' . json_last_error_msg());
             return ['error' => 'Error parsing JSON response: ' . json_last_error_msg(), 'response' => $body];
         }
 
         // Verificar la respuesta de la API
         error_log('API Response: ' . print_r($result, true));
 
         if (isset($result['data']['offers'])) {
             return $result['data']['offers'];
         }
 
         error_log('No data found in API response');
         return ['error' => 'No data found in API response', 'response' => $result];
     }
 }
 
 // Función para manejar la solicitud AJAX y buscar vuelos en Duffel
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
 add_action('wp_ajax_duffel_search_flights', 'duffel_search_flights_ajax_handler');
 add_action('wp_ajax_nopriv_duffel_search_flights', 'duffel_search_flights_ajax_handler');
 
 // Función para crear un producto en WooCommerce para un vuelo
 function create_flight_product($flight_details) {
     $product_name = 'Vuelo ' . $flight_details['flight_number'];
     $existing_product_id = wc_get_product_id_by_sku($flight_details['flight_number']);
     
     if (!$existing_product_id) {
         $product = new WC_Product_Simple();
         $product->set_name($product_name);
         $product->set_regular_price($flight_details['price']);
         $product->set_sku($flight_details['flight_number']);
         $product->set_description($flight_details['description']);
         $product->set_virtual(true);
         $product->save();
 
         return $product->get_id();
     }
 
     return $existing_product_id;
 }
 
 // Función para manejar la solicitud AJAX y añadir vuelos al carrito
// Añadir acciones AJAX
add_action('wp_ajax_add_flight_to_cart', 'add_flight_to_cart');
add_action('wp_ajax_nopriv_add_flight_to_cart', 'add_flight_to_cart');

function add_flight_to_cart() {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Registrar la entrada para depuración
    error_log('Received input: ' . print_r($input, true));

    if (!isset($input['flight_details'])) {
        error_log('Detalles del vuelo faltantes.');
        wp_send_json_error('Detalles del vuelo faltantes.');
        return;
    }

    $flight_details = $input['flight_details'];

    if (isset($flight_details['outbound']) && isset($flight_details['return'])) {
        $outbound_flight = $flight_details['outbound'];
        $return_flight = $flight_details['return'];

        $outbound_product_id = create_flight_product($outbound_flight);
        $return_product_id = create_flight_product($return_flight);

        if ($outbound_product_id && $return_product_id) {
            WC()->cart->add_to_cart($outbound_product_id);
            WC()->cart->add_to_cart($return_product_id);
            wp_send_json_success('Vuelos añadidos al carrito.');
        } else {
            error_log('Error al crear los productos.');
            wp_send_json_error('Error al crear los productos.');
        }
    } else {
        $product_id = create_flight_product($flight_details);

        if ($product_id) {
            WC()->cart->add_to_cart($product_id);
            wp_send_json_success('Vuelo añadido al carrito.');
        } else {
            error_log('Error al crear el producto.');
            wp_send_json_error('Error al crear el producto.');
        }
    }
}

 
 // Shortcode para mostrar el formulario de búsqueda de vuelos
 function duffel_search_flights_shortcode($atts) {
     ob_start();
     ?>
     <div id="duffel-flight-search">
         <!-- Paso 1: Selección del tipo de viaje -->
         <div id="step-1" class="step active">
             <h2>Selecciona el tipo de viaje</h2>
             <form id="search-form" class="duffel-search-form" method="POST">
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
 
                 <button type="button" id="next-to-step-2">Siguiente</button>
             </form>
         </div>
 
         <!-- Paso 2: Selección del vuelo de ida -->
         <div id="step-2" class="step">
             <h2>Selecciona tu vuelo de ida</h2>
             <div id="outbound-flights" class="duffel-flights">
                 <!-- Aquí se cargarán las tarjetas de los vuelos de ida -->
             </div>
             <button type="button" id="next-to-step-3" style="display:none;">Siguiente</button>
         </div>
 
         <!-- Paso 3: Selección del vuelo de vuelta -->
         <div id="step-3" class="step">
             <h2>Selecciona tu vuelo de vuelta</h2>
             <div id="return-flights" class="duffel-flights">
                 <!-- Aquí se cargarán las tarjetas de los vuelos de vuelta -->
             </div>
             <button type="submit" id="submit-form">Enviar</button>
         </div>
     </div>
     <?php 
     return ob_get_clean();
 }
 add_shortcode('duffel_search_flights', 'duffel_search_flights_shortcode');
 
 // Encolar el archivo CSS y JS
 function duffel_search_flights_enqueue_assets() {
     wp_enqueue_style('duffel-styles', plugin_dir_url(__FILE__) . 'includes/css/duffel-styles.css');
     wp_enqueue_script('duffel-scripts', plugin_dir_url(__FILE__) . 'includes/js/duffel-scripts.js', array('jquery'), null, true);
     wp_localize_script('duffel-scripts', 'ajaxurl', admin_url('admin-ajax.php'));
 }
 add_action('wp_enqueue_scripts', 'duffel_search_flights_enqueue_assets');
 
 ?>
 
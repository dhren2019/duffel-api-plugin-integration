<?php
/**
 * Plugin Name: Duffel API Integration
 * Description: Integración con la API de Duffel para buscar vuelos.
 * Version: 1.2
 * Author: Dhren
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Función para buscar vuelos en Duffel
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
        $result = json_decode($body, true);

        if ($result === null) {
            error_log('Error parsing JSON response: ' . json_last_error_msg());
            return ['error' => 'Error parsing JSON response: ' . json_last_error_msg(), 'response' => $body];
        }

        if (isset($result['data']['offers'])) {
            return $result['data']['offers'];
        }

        error_log('No data found in API response');
        return ['error' => 'No data found in API response', 'response' => $result];
    }
}

// Manejador AJAX para buscar vuelos
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
            <button type="button" id="next-to-step-4" style="display:none;">Siguiente</button>
        </div>

        <!-- Paso 4: Resumen del itinerario -->
        <div id="step-4" class="step">
            <div id="itinerary-summary-container">
                <div class="duffel-itinerary-details">
                    <div id="itinerary-summary">
                        <!-- Aquí se mostrará el resumen del itinerario -->
                        <input type="hidden" id="selected-offer-id" value="">
                        <span id="total-amount">$0.00</span>
                    </div>
                </div>
                <div class="duffel-itinerary-summary">
                    <div id="summary-details">
                        <!-- Aquí se mostrarán los detalles del resumen -->
                    </div>
                    <button type="button" id="go-to-checkout">Ir al Checkout</button>
                </div>
            </div>
        </div>

        <!-- Sección: Formulario de Checkout -->
        <div id="checkout-section" style="display: none;">
            <h2>Detalles del Pasajero y Pago</h2>

            <!-- Formulario para datos del pasajero -->
            <div id="passenger-details-form">
                <h3>Detalles del Pasajero</h3>
                <input type="text" id="passenger-email" placeholder="Email">
                <input type="text" id="passenger-phone" placeholder="Teléfono">
                <input type="text" id="passenger-given-name" placeholder="Nombre">
                <input type="text" id="passenger-family-name" placeholder="Apellido">
                <input type="date" id="passenger-dob" placeholder="Fecha de nacimiento">
                <select id="passenger-gender">
                    <option value="male">Masculino</option>
                    <option value="female">Femenino</option>
                </select>
            </div>

            <!-- Formulario para opciones adicionales -->
            <div id="additional-options-form">
                <h3>Opciones Adicionales</h3>
                <div>
                    <input type="checkbox" id="extra-baggage">
                    <label for="extra-baggage">Equipaje adicional</label>
                </div>
                <div>
                    <input type="checkbox" id="seat-selection">
                    <label for="seat-selection">Selección de asiento</label>
                </div>
            </div>

            <!-- Contenedor del formulario de tarjeta -->
            <div id="payment-form">
            <h3>Detalles del Pago</h3>
            <div id="card-element"></div> <!-- Duffel montará el formulario aquí -->
             <button id="pay-button">Pagar</button>
            </div>


            <!-- Confirmación de pago -->
            <div id="payment-confirmation"></div>
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

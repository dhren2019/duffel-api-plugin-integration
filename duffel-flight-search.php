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

// Encolar el archivo CSS
function duffel_search_flights_enqueue_styles() {
    wp_enqueue_style('duffel-styles', plugin_dir_url(__FILE__) . 'includes/css/duffel-styles.css');
}
add_action('wp_enqueue_scripts', 'duffel_search_flights_enqueue_styles');

// Definir el shortcode
function duffel_search_flights_shortcode($atts) {
    ob_start();
    ?>
    <form method="POST" class="duffel-search-form">
        <?php wp_nonce_field('duffel_search_flights_action', 'duffel_search_flights_nonce'); ?>

        <div class="form-group">
            <label for="trip_type">Tipo de Viaje:</label>
            <select name="trip_type" id="trip_type" onchange="toggleReturnDateField()">
                <option value="oneway">Solo Ida</option>
                <option value="return">Ida y Vuelta</option>
            </select>
        </div>

        <div class="form-group">
            <label for="origin">Origen:</label>
            <input type="text" name="origin" id="origin" placeholder="LHR (London Heathrow)" required>
        </div>

        <div class="form-group">
            <label for="destination">Destino:</label>
            <input type="text" name="destination" id="destination" placeholder="JFK (John F Kennedy)" required>
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

        <button type="submit" name="search_flights">Buscar Vuelos</button>
    </form>

    <?php
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['duffel_search_flights_nonce']) && wp_verify_nonce($_POST['duffel_search_flights_nonce'], 'duffel_search_flights_action')) {
        $origin = sanitize_text_field($_POST['origin']);
        $destination = sanitize_text_field($_POST['destination']);
        $departure_date = sanitize_text_field($_POST['departure_date']);
        $return_date = isset($_POST['return_date']) ? sanitize_text_field($_POST['return_date']) : null;
    
        // Verificar los datos antes de enviarlos a la API
        error_log('Origin: ' . $origin);
        error_log('Destination: ' . $destination);
        error_log('Departure Date: ' . $departure_date);
        error_log('Return Date: ' . $return_date);
    
        $flights = duffel_search_flights($origin, $destination, $departure_date, $return_date);
    

        if (!empty($flights)) {
            echo '<div class="duffel-flights">';
            foreach ($flights as $flight) {
                // Procesar vuelo de ida
                $outbound_flight = $flight['slices'][0];
                $outbound_flight_number = isset($outbound_flight['segments'][0]['marketing_flight_number']) ? $outbound_flight['segments'][0]['marketing_flight_number'] : 'N/A';
                $outbound_departure = isset($outbound_flight['segments'][0]['departing_at']) ? $outbound_flight['segments'][0]['departing_at'] : 'N/A';
                $outbound_arrival = isset($outbound_flight['segments'][0]['arriving_at']) ? $outbound_flight['segments'][0]['arriving_at'] : 'N/A';
                $outbound_origin_iata = isset($outbound_flight['origin']['iata_code']) ? $outbound_flight['origin']['iata_code'] : 'N/A';
                $outbound_destination_iata = isset($outbound_flight['destination']['iata_code']) ? $outbound_flight['destination']['iata_code'] : 'N/A';
                $outbound_airline_logo = isset($outbound_flight['segments'][0]['operating_carrier']['logo_symbol_url']) ? $outbound_flight['segments'][0]['operating_carrier']['logo_symbol_url'] : '';
                $outbound_duration = isset($outbound_flight['duration']) ? $outbound_flight['duration'] : 'N/A';
                $outbound_stops = count($outbound_flight['segments']) - 1;

                echo '<div class="flight">';
                if ($outbound_airline_logo) {
                    echo '<img src="' . esc_url($outbound_airline_logo) . '" alt="Airline Logo" class="airline-logo">';
                }
                echo '<div class="flight-details">';
                echo '<div><p>' . esc_html($outbound_departure) . ' – ' . esc_html($outbound_arrival) . '</p><p>Duración: ' . esc_html($outbound_duration) . '</p></div>';
                echo '<div><p>Línea aérea: ' . esc_html($outbound_flight['segments'][0]['operating_carrier']['name']) . '</p><p>' . esc_html($outbound_stops) . ' parada(s)</p></div>';
                echo '<div><p>Itinerario: ' . esc_html($outbound_origin_iata) . ' → ' . esc_html($outbound_destination_iata) . '</p></div>';
                echo '<div class="flight-price"><p>Desde €' . esc_html($flight['total_amount']) . ' ' . esc_html($flight['total_currency']) . '</p></div>';
                echo '</div>';
                echo '<div class="flight-select">';
                echo '<button>Seleccionar</button>';
                echo '</div>';
                echo '</div>';

                // Procesar vuelo de vuelta si existe
                if (isset($flight['slices'][1])) {
                    $inbound_flight = $flight['slices'][1];
                    $inbound_flight_number = isset($inbound_flight['segments'][0]['marketing_flight_number']) ? $inbound_flight['segments'][0]['marketing_flight_number'] : 'N/A';
                    $inbound_departure = isset($inbound_flight['segments'][0]['departing_at']) ? $inbound_flight['segments'][0]['departing_at'] : 'N/A';
                    $inbound_arrival = isset($inbound_flight['segments'][0]['arriving_at']) ? $inbound_flight['segments'][0]['arriving_at'] : 'N/A';
                    $inbound_origin_iata = isset($inbound_flight['origin']['iata_code']) ? $inbound_flight['origin']['iata_code'] : 'N/A';
                    $inbound_destination_iata = isset($inbound_flight['destination']['iata_code']) ? $inbound_flight['destination']['iata_code'] : 'N/A';
                    $inbound_airline_logo = isset($inbound_flight['segments'][0]['operating_carrier']['logo_symbol_url']) ? $inbound_flight['segments'][0]['operating_carrier']['logo_symbol_url'] : '';
                    $inbound_duration = isset($inbound_flight['duration']) ? $inbound_flight['duration'] : 'N/A';
                    $inbound_stops = count($inbound_flight['segments']) - 1;

                    echo '<div class="flight">';
                    if ($inbound_airline_logo) {
                        echo '<img src="' . esc_url($inbound_airline_logo) . '" alt="Airline Logo" class="airline-logo">';
                    }
                    echo '<div class="flight-details">';
                    echo '<div><p>' . esc_html($inbound_departure) . ' – ' . esc_html($inbound_arrival) . '</p><p>Duración: ' . esc_html($inbound_duration) . '</p></div>';
                    echo '<div><p>Línea aérea: ' . esc_html($inbound_flight['segments'][0]['operating_carrier']['name']) . '</p><p>' . esc_html($inbound_stops) . ' parada(s)</p></div>';
                    echo '<div><p>Itinerario: ' . esc_html($inbound_origin_iata) . ' → ' . esc_html($inbound_destination_iata) . '</p></div>';
                    echo '<div class="flight-price"><p>Desde €' . esc_html($flight['total_amount']) . ' ' . esc_html($flight['total_currency']) . '</p></div>';
                    echo '</div>';
                    echo '<div class="flight-select">';
                    echo '<button>Seleccionar</button>';
                    echo '</div>';
                    echo '</div>';
                }
            }
            echo '</div>';
        } else {
            echo '<p>No se encontraron vuelos.</p>';
        }
    }

    return ob_get_clean();
}
?>

<script>
function toggleReturnDateField() {
    var tripType = document.getElementById('trip_type').value;
    var returnDateGroup = document.getElementById('return-date-group');
    if (tripType === 'return') {
        returnDateGroup.style.display = 'block';
    } else {
        returnDateGroup.style.display = 'none';
    }
}

document.querySelector('.duffel-search-form').addEventListener('submit', function(event) {
    var tripType = document.getElementById('trip_type').value;
    var returnDate = document.getElementById('return_date').value;
    console.log('Tipo de Viaje:', tripType);
    console.log('Fecha de Vuelta:', returnDate);
});

</script>

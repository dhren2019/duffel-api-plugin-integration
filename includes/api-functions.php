<?php

if (!function_exists('duffel_search_flights')) {
    function duffel_search_flights(WP_REST_Request $request) {
        $api_key = get_option('duffel_api_key'); // Recupera la clave API desde la configuración
        if (!$api_key) {
            return new WP_Error('no_api_key', 'La clave API de Duffel no está configurada.');
        }

        $params = $request->get_params();

        // Estructura los datos de la solicitud con los campos obligatorios
        $request_body = [
            'slices' => [
                [
                    'origin' => $params['origin'] ?? 'LHR', // Origen (código IATA)
                    'destination' => $params['destination'] ?? 'JFK', // Destino (código IATA)
                    'departure_date' => $params['departure_date'] ?? '2024-10-01' // Fecha de salida
                ]
            ],
            'passengers' => [
                [
                    'type' => 'adult' // Tipo de pasajero (adult, child, etc.)
                ]
            ]
        ];

        // Hacer la solicitud a la API de Duffel
        $response = wp_remote_post('https://api.duffel.com/air/offer_requests', array(
            'method' => 'POST',
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
                'Duffel-Version' => 'v1', // Asegúrate de incluir la versión de la API
            ),
            'body' => json_encode([
                'data' => $request_body
            ]),
             'timeout' => 30, // Aumenta el tiempo de espera a 30 segundos (ajusta según sea necesario)
        ));

        if (is_wp_error($response)) {
            return new WP_Error('error', 'Error en la solicitud: ' . $response->get_error_message());
        }

        return json_decode(wp_remote_retrieve_body($response), true);
    }
}

// Registrar el endpoint para manejar la búsqueda de vuelos
add_action('rest_api_init', function () {
    register_rest_route('duffel/v1', '/search', array(
        'methods' => 'POST',
        'callback' => 'duffel_search_flights',
    ));
});

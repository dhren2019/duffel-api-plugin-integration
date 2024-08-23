<?php

if (!function_exists('duffel_search_flights')) {
    function duffel_search_flights(WP_REST_Request $request) {
        $api_key = get_option('duffel_api_key');

        // Verifica si la clave API está configurada
        if (!$api_key) {
            error_log('Error: Clave API no configurada');
            return new WP_Error('no_api_key', 'La clave API de Duffel no está configurada.');
        }

        // Obtiene los parámetros del request
        $params = $request->get_params();
        error_log('Parámetros recibidos: ' . print_r($params, true)); // Log de los parámetros recibidos

        // Verifica que los parámetros necesarios estén presentes
        if (empty($params['origin']) || empty($params['destination']) || empty($params['departure_date'])) {
            error_log('Error: Faltan algunos parámetros requeridos');
            return new WP_Error('missing_params', 'Faltan algunos parámetros requeridos (origin, destination, departure_date).');
        }

        // Estructura los datos de la solicitud
        $request_body = [
            'slices' => [
                [
                    'origin' => $params['origin'],
                    'destination' => $params['destination'],
                    'departure_date' => $params['departure_date']
                ]
            ],
            'passengers' => [
                [
                    'type' => 'adult' // Tipo de pasajero (adult, child, etc.)
                ]
            ]
        ];

        error_log('Cuerpo de la solicitud: ' . json_encode($request_body)); // Log del cuerpo de la solicitud

        // Realiza la solicitud a la API de Duffel
        $response = wp_remote_post('https://api.duffel.com/air/offer_requests', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
                'Duffel-Version' => 'v1',
            ),
            'body' => json_encode(['data' => $request_body]),
        ));

        // Verifica si hay errores en la solicitud
        if (is_wp_error($response)) {
            error_log('Error en la solicitud a Duffel: ' . $response->get_error_message());
            return new WP_Error('api_error', 'Error en la solicitud a Duffel: ' . $response->get_error_message());
        }

        $body = wp_remote_retrieve_body($response);
        error_log('Respuesta de Duffel: ' . $body); // Log de la respuesta de Duffel

        return json_decode($body, true);
    }
}


if (!function_exists('duffel_proxy_locations')) {
    function duffel_proxy_locations(WP_REST_Request $request) {
        $query = $request->get_param('query');
        $api_key = get_option('duffel_api_key');

        if (!$api_key) {
            return new WP_Error('no_api_key', 'La clave API de Duffel no está configurada.');
        }

        $response = wp_remote_get("https://api.duffel.com/places/suggestions?query=" . urlencode($query), [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
                'Duffel-Version' => 'v1',
            ],
        ]);

        if (is_wp_error($response)) {
            return new WP_Error('api_error', 'Error en la solicitud a Duffel: ' . $response->get_error_message());
        }

        $body = wp_remote_retrieve_body($response);

        if (empty($body)) {
            return new WP_Error('empty_response', 'La respuesta de la API está vacía.');
        }

        return json_decode($body, true);
    }
}

add_action('rest_api_init', function () {
    register_rest_route('duffel/v1', '/proxy-locations', [
        'methods' => 'GET',
        'callback' => 'duffel_proxy_locations',
    ]);

    register_rest_route('duffel/v1', '/search', [
        'methods' => 'POST',
        'callback' => 'duffel_search_flights',
    ]);
});

<?php

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

if (!function_exists('duffel_create_payment_intent')) {
    function duffel_create_payment_intent($amount, $currency, $offer_id) {
        $api_key = get_option('duffel_api_key');
        $url = 'https://api.duffel.com/payments/payment_intents';

        // Estructura de los datos para crear el Payment Intent
        $data = [
            "data" => [
                "amount" => $amount,
                "currency" => $currency,
                "payment_methods" => [
                    "type" => "card"
                ],
                "offer_id" => $offer_id
            ]
        ];

        // Enviar la solicitud a Duffel
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

        // Manejo de errores en la solicitud
        if (is_wp_error($response)) {
            error_log('Error en la solicitud de la API: ' . $response->get_error_message());
            return ['error' => 'Error en la solicitud de la API: ' . $response->get_error_message()];
        }

        // Obtener la respuesta y convertirla a un array
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);

        // Verificar si la respuesta es válida
        if ($result === null) {
            error_log('Error al analizar la respuesta JSON: ' . json_last_error_msg());
            return ['error' => 'Error al analizar la respuesta JSON: ' . json_last_error_msg(), 'response' => $body];
        }

        // Manejar la respuesta
        if (isset($result['data'])) {
            return $result['data']; // Devolver la información del Payment Intent
        } else {
            error_log('Error en la creación del Payment Intent: ' . print_r($result, true));
            return ['error' => 'Error en la creación del Payment Intent', 'response' => $result];
        }
    }
}

// Función AJAX para crear Payment Intent
function duffel_create_payment_intent_ajax_handler() {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['amount']) || !isset($input['currency']) || !isset($input['offer_id'])) {
        wp_send_json_error('Faltan parámetros en la solicitud.');
        return;
    }

    $amount = sanitize_text_field($input['amount']);
    $currency = sanitize_text_field($input['currency']);
    $offer_id = sanitize_text_field($input['offer_id']);
    $payment_intent = duffel_create_payment_intent($amount, $currency, $offer_id);

    if (isset($payment_intent['id'])) {
        wp_send_json_success($payment_intent);
    } else {
        wp_send_json_error('Fallo en la creación del Payment Intent');
    }
}

add_action('wp_ajax_duffel_create_payment_intent', 'duffel_create_payment_intent_ajax_handler');
add_action('wp_ajax_nopriv_duffel_create_payment_intent', 'duffel_create_payment_intent_ajax_handler');

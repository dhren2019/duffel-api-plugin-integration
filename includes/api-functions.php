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

// Nuevo código para crear Payment Intent en Duffel
if (!function_exists('duffel_create_payment_intent')) {
    function duffel_create_payment_intent($amount, $currency) {
        $api_key = get_option('duffel_api_key');
        $url = 'https://api.duffel.com/air/payment_intents';

        $data = [
            "data" => [
                "amount" => $amount,
                "currency" => $currency
            ]
        ];

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

        if (isset($payment_intent['data'])) {
            wp_send_json_success($payment_intent['data']);
        } else {
            wp_send_json_error('Payment Intent creation failed');
            error_log('Payment Intent response: ' . print_r($payment_intent, true)); // Añade un log para ver la respuesta de Duffel
        }
        

        if ($result === null) {
            error_log('Error parsing JSON response: ' . json_last_error_msg());
            return ['error' => 'Error parsing JSON response: ' . json_last_error_msg(), 'response' => $body];
        }

        return $result;
    }
}

// Manejador AJAX para crear Payment Intent
function duffel_create_payment_intent_ajax_handler() {
    $input = json_decode(file_get_contents('php://input'), true);

    error_log('Datos recibidos: ' . print_r($input, true)); // Log para verificar los datos recibidos
    error_log('duffel_create_payment_intent_ajax_handler called'); // Registro para depuración
    if (!isset($input['amount']) || !isset($input['currency'])) {
        wp_send_json_error('Missing parameters');
        return;
    }

    $amount = sanitize_text_field($input['amount']);
    $currency = sanitize_text_field($input['currency']);
    $offer_id = sanitize_text_field($input['offer_id']); // Añade esto si se requiere offer_id
    $payment_intent = duffel_create_payment_intent($amount, $currency);

    if (isset($payment_intent['data'])) {
        wp_send_json_success($payment_intent['data']);
    } else {
        wp_send_json_error('Payment Intent creation failed');
    }
}

add_action('wp_ajax_duffel_create_payment_intent', 'duffel_create_payment_intent_ajax_handler');
add_action('wp_ajax_nopriv_duffel_create_payment_intent', 'duffel_create_payment_intent_ajax_handler');



// Manejador de prueba para AJAX
function test_ajax_handler() {
    wp_send_json_success('AJAX funciona correctamente');
}
add_action('wp_ajax_test_ajax', 'test_ajax_handler');
add_action('wp_ajax_nopriv_test_ajax', 'test_ajax_handler');

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

function duffel_create_payment_intent($amount, $currency, $offer_id) {
    $api_key = get_option('duffel_api_key');
    $url = 'https://api.duffel.com/payments/payment_intents';

    $data = [
        "data" => [
            "amount" => $amount,
            "currency" => $currency,
            "offer_id" => $offer_id // Asegúrate de que este parámetro se envíe correctamente
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
        return ['error' => 'Error in API request: ' . $response->get_error_message()];
    }

    $body = wp_remote_retrieve_body($response);
    $result = json_decode($body, true);

    if ($result === null) {
        return ['error' => 'Error parsing JSON response: ' . json_last_error_msg()];
    }

    return $result;
}


function duffel_create_payment_intent_ajax_handler() {
    $input = json_decode(file_get_contents('php://input'), true);

    error_log('Datos recibidos en AJAX: ' . print_r($input, true)); // Log para depurar

    // Validar si los parámetros son correctos
    if (!isset($input['amount']) || !isset($input['currency']) || !isset($input['offer_id'])) {
        wp_send_json_error('Faltan parámetros en la solicitud.');
        return; // Evita que el código siga ejecutándose
    }

    $amount = sanitize_text_field($input['amount']);
    $currency = sanitize_text_field($input['currency']);
    $offer_id = sanitize_text_field($input['offer_id']);

    $payment_intent = duffel_create_payment_intent($amount, $currency, $offer_id);

    if (isset($payment_intent['data'])) {
        // Respuesta exitosa
        wp_send_json_success($payment_intent['data']);
    } else {
        // Error al crear el Payment Intent
        error_log('Error creando Payment Intent: ' . print_r($payment_intent, true)); // Log para depurar
        wp_send_json_error('Error al crear el Payment Intent.');
    }
    
    // NO deberías llegar aquí, pero si lo haces, responde con un error genérico
    wp_send_json_error('Error inesperado.');
}

add_action('wp_ajax_duffel_create_payment_intent', 'duffel_create_payment_intent_ajax_handler');
add_action('wp_ajax_nopriv_duffel_create_payment_intent', 'duffel_create_payment_intent_ajax_handler');



// Manejador de prueba para AJAX
function test_ajax_handler() {
    wp_send_json_success('AJAX funciona correctamente');
}
add_action('wp_ajax_test_ajax', 'test_ajax_handler');
add_action('wp_ajax_nopriv_test_ajax', 'test_ajax_handler');

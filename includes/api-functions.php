<?php

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

// Función para buscar vuelos en Duffel.
if (!function_exists('duffel_search_flights')) {
    function duffel_search_flights($origin, $destination, $departure_date, $return_date = null) {
        $api_key = get_option('duffel_api_key');
        $url = 'https://api.duffel.com/air/offer_requests';

        // Estructura de los datos para la solicitud.
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

        // Realiza la solicitud a la API.
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

        // Manejo de errores.
        if (is_wp_error($response)) {
            error_log('Error in API request: ' . $response->get_error_message());
            return ['error' => 'Error in API request: ' . $response->get_error_message()];
        }

        // Obtiene y decodifica la respuesta.
        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);

        if ($result === null) {
            error_log('Error parsing JSON response: ' . json_last_error_msg());
            return ['error' => 'Error parsing JSON response: ' . json_last_error_msg(), 'response' => $body];
        }

        // Verifica si hay ofertas en la respuesta.
        if (isset($result['data']['offers'])) {
            return $result['data']['offers'];
        }

        // Si no hay datos en la respuesta, devuelve un error.
        error_log('No data found in API response');
        return ['error' => 'No data found in API response', 'response' => $result];
    }
}

// Función para crear un Payment Intent en Stripe.
if (!function_exists('create_stripe_payment_intent')) {
    function create_stripe_payment_intent($amount, $currency, $offer_id) {
        $stripe_secret_key = get_option('stripe_secret_key');

        \Stripe\Stripe::setApiKey($stripe_secret_key);

        try {
            $payment_intent = \Stripe\PaymentIntent::create([
                'amount' => $amount * 100, // Stripe trabaja con el monto en centavos
                'currency' => $currency,
                'payment_method_types' => ['card'],
                'metadata' => ['offer_id' => $offer_id],
            ]);

            return $payment_intent;
        } catch (\Stripe\Exception\ApiErrorException $e) {
            error_log('Error creating Stripe PaymentIntent: ' . $e->getMessage());
            return ['error' => $e->getMessage()];
        }
    }
}

// Función para confirmar un Payment Intent en Duffel.
if (!function_exists('confirm_duffel_payment_intent')) {
    function confirm_duffel_payment_intent($payment_intent_id) {
        $api_key = get_option('duffel_api_key');
        $url = "https://api.duffel.com/payments/payment_intents/$payment_intent_id/actions/confirm";

        $response = wp_remote_post($url, [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Duffel-Version' => 'v1',
                'Content-Type' => 'application/json'
            ],
        ]);

        if (is_wp_error($response)) {
            return ['error' => $response->get_error_message()];
        } else {
            $body = wp_remote_retrieve_body($response);
            $result = json_decode($body, true);

            if (isset($result['data'])) {
                return $result['data'];
            } else {
                return ['error' => $result];
            }
        }
    }
}

// Manejador AJAX para crear un Payment Intent en Stripe.
function duffel_create_stripe_payment_intent_ajax_handler() {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!isset($input['amount']) || !isset($input['currency']) || !isset($input['offer_id'])) {
        wp_send_json_error('Faltan parámetros en la solicitud.');
        return;
    }

    $amount = sanitize_text_field($input['amount']);
    $currency = sanitize_text_field($input['currency']);
    $offer_id = sanitize_text_field($input['offer_id']);
    $payment_intent = create_stripe_payment_intent($amount, $currency, $offer_id);

    if (isset($payment_intent['id'])) {
        wp_send_json_success($payment_intent);
    } else {
        wp_send_json_error($payment_intent['error']);
    }
}

// Manejador AJAX para confirmar un Payment Intent en Duffel.
function duffel_confirm_payment_intent_ajax_handler() {
    $payment_intent_id = sanitize_text_field($_POST['payment_intent_id']);
    $result = confirm_duffel_payment_intent($payment_intent_id);

    if (isset($result['id'])) {
        wp_send_json_success($result);
    } else {
        wp_send_json_error($result['error']);
    }
}

// Registra los manejadores AJAX.
add_action('wp_ajax_duffel_search_flights', 'duffel_search_flights_ajax_handler');
add_action('wp_ajax_nopriv_duffel_search_flights', 'duffel_search_flights_ajax_handler');
add_action('wp_ajax_duffel_create_stripe_payment_intent', 'duffel_create_stripe_payment_intent_ajax_handler');
add_action('wp_ajax_nopriv_duffel_create_stripe_payment_intent', 'duffel_create_stripe_payment_intent_ajax_handler');
add_action('wp_ajax_duffel_confirm_payment_intent', 'duffel_confirm_payment_intent_ajax_handler');
add_action('wp_ajax_nopriv_duffel_confirm_payment_intent', 'duffel_confirm_payment_intent_ajax_handler');


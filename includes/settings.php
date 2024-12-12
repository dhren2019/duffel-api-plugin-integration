
<?php
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

function duffel_api_settings() {
    register_setting('duffel_api_settings_group', 'duffel_api_key');
    add_settings_section('duffel_api_main_section', 'Duffel API Settings', 'duffel_api_section_callback', 'duffel_api');
    add_settings_field('duffel_api_key_field', 'Duffel API Key', 'duffel_api_key_field_callback', 'duffel_api', 'duffel_api_main_section');
}

function duffel_api_section_callback() {
    echo '<p>Configuración para la API de Duffel</p>';
}

function duffel_api_key_field_callback() {
    $setting = get_option('duffel_api_key');
    echo "<input type='text' name='duffel_api_key' value='" . esc_attr($setting) . "' />";
}

add_action('admin_init', 'duffel_api_settings');

function duffel_add_admin_menu() {
    add_options_page(
        'Duffel API Settings', // Título de la página
        'Duffel API',          // Título del menú
        'manage_options',      // Capacidad requerida
        'duffel_api',          // Slug del menú
        'duffel_api_options_page' // Función que muestra la página
    );
}
add_action('admin_menu', 'duffel_add_admin_menu');

function duffel_api_options_page() {
    ?>
    <div class="wrap">
        <h1>Configuración de la API de Duffel</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('duffel_api_settings_group');
            do_settings_sections('duffel_api');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

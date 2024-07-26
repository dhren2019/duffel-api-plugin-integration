![Version 1.0](https://img.shields.io/badge/version-1.0-blue)

# Duffel API Integration Plugin

## Descripción

El **Duffel API Integration Plugin** es una herramienta poderosa y fácil de usar para integrar la funcionalidad de búsqueda de vuelos en tu sitio web de WordPress. Utiliza la API de Duffel para obtener información sobre vuelos, permitiendo a los usuarios buscar y ver detalles de vuelos directamente desde tu sitio.

## Características

- Búsqueda de vuelos de ida y vuelta.
- Visualización de detalles del vuelo, incluyendo número de vuelo, itinerario, fechas y precios.
- Integración sencilla mediante shortcode.
- Personalización del estilo de los resultados mediante CSS.

## Requisitos

- WordPress 5.0 o superior.
- PHP 7.0 o superior.
- Cuenta de desarrollador en Duffel con credenciales API.

## Instalación

1. **Descargar y Descomprimir:**
   - Descarga el archivo ZIP del plugin desde el repositorio.
   - Descomprime el archivo ZIP.

2. **Subir al Servidor:**
   - Usa tu cliente FTP preferido para subir la carpeta descomprimida `duffel-api-integration` al directorio `/wp-content/plugins/` de tu instalación de WordPress.

3. **Activar el Plugin:**
   - Ve a tu panel de administración de WordPress.
   - Navega a `Plugins > Añadir nuevo`.
   - Haz clic en `Subir plugin` y selecciona el archivo ZIP descargado.
   - Una vez subido, activa el plugin desde la página de plugins.

## Uso

### Shortcode

Para utilizar el plugin, inserta el siguiente shortcode en cualquier página o entrada donde desees que aparezca el formulario de búsqueda de vuelos:

```html
[duffel_search_flights]

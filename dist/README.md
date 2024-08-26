Aquí tienes el contenido del archivo en un formato totalmente en Markdown:

---

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
```

## Desarrollo

### Requisitos de Desarrollo

Para trabajar en el desarrollo de este plugin, necesitarás:

- Node.js 14 o superior.
- npm 6 o superior.

### Instalación de Dependencias

Este proyecto utiliza varias dependencias de desarrollo, como Webpack, Babel y herramientas para manejar React. Las dependencias necesarias se encuentran en el archivo `package.json`.

#### Dependencias de Desarrollo Incluidas

Las principales dependencias incluyen Webpack y Babel, que se utilizan para compilar y empaquetar el código React para producción. Puedes revisar todas las dependencias en el archivo `package.json`.

### Scripts Disponibles

En el archivo `package.json` se incluyen varios scripts para ayudarte en el desarrollo:

#### Compilación para Producción

Este comando compila el código React para producción, minificándolo y optimizándolo:

```bash
npm run build
```

Este comando genera el archivo `duffel-react-bundle.js` en la carpeta `includes/js/`.

#### Desarrollo Activo con Recarga Automática

Ejecuta Webpack en modo de desarrollo para compilar el código React y ver los cambios en tiempo real:

```bash
npm run dev
```

Este comando inicia un proceso de desarrollo con recarga automática cuando haces cambios en los archivos.

#### Copiar Archivos para Producción

Este comando copia los archivos necesarios a una carpeta `dist/` para preparar el plugin para su distribución:

```bash
npm run copy-files
```

Esto asegura que solo los archivos necesarios para producción se empaqueten en el ZIP.

## Estructura del Proyecto

```plaintext
duffel-api-plugin-integration/
│
├── duffel-flight-search.php       # Archivo principal del plugin
├── includes/
│   ├── css/
│   │   └── duffel-styles.css      # Estilos personalizados
│   ├── js/
│   │   └── duffel-react-bundle.js # Archivo JavaScript compilado con React
│   ├── api-functions.php          # Lógica para manejar la API de Duffel
│   └── settings.php               # Configuración de la API de Duffel
├── src/                           # Código fuente React (solo para desarrollo)
│   ├── index.js                   # Punto de entrada principal
│   └── components/
│       └── FlightSearch.js        # Componente React para la búsqueda de vuelos
├── webpack.config.js              # Configuración de Webpack
├── package.json                   # Dependencias y scripts de npm
├── README.md                      # Este archivo
└── .gitignore                     # Archivos y carpetas a ignorar en Git
```
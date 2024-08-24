import React from 'react';
import { render } from 'react-dom';
import FlightSearch from './components/FlightSearch'; // Tu componente React para la búsqueda de vuelos

document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('duffel-flight-search');
    if (container) {
        render(<FlightSearch />, container);
    }
});

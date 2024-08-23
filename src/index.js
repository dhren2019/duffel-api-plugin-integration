import React from 'react';
import { render } from 'react-dom';
import FlightSearch from './components/FlightSearch';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('duffel-flight-search');
    if (container) {
        render(<FlightSearch />, container);
    }
});

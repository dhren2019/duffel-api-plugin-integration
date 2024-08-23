import React, { useState } from 'react';

function FlightSearch() {
    const [results, setResults] = useState(null);

    const handleSearch = (event) => {
        event.preventDefault();

        // Ejemplo de parámetros para la búsqueda
        const searchParams = {
            origin: 'LHR',
            destination: 'JFK',
            departure_date: '2024-10-01'
        };

        fetch('/wp-json/duffel/v1/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchParams)
        })
        .then(response => response.json())
        .then(data => setResults(data))
        .catch(error => console.error('Error en la búsqueda:', error));
    };

    return (
        <div>
            <h2>Busca tu vuelo</h2>
            <form onSubmit={handleSearch}>
                <button type="submit">Buscar</button>
            </form>
            {results && <pre>{JSON.stringify(results, null, 2)}</pre>}
        </div>
    );
}

export default FlightSearch;

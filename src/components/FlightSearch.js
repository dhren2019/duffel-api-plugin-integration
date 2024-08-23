import React, { useState } from 'react';

function FlightSearch() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [departureDate, setDepartureDate] = useState('');
    const [results, setResults] = useState(null);

    const handleSearch = (event) => {
        event.preventDefault();

        // Datos de la solicitud
        const searchParams = {
            origin: origin || 'LHR', // Código IATA de origen (default: LHR)
            destination: destination || 'JFK', // Código IATA de destino (default: JFK)
            departure_date: departureDate || '2024-10-01', // Fecha de salida (default)
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
                <div>
                    <label>Origen</label>
                    <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="LHR" />
                </div>
                <div>
                    <label>Destino</label>
                    <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="JFK" />
                </div>
                <div>
                    <label>Fecha de salida</label>
                    <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
                </div>
                <button type="submit">Buscar</button>
            </form>
            {results && <pre>{JSON.stringify(results, null, 2)}</pre>}
        </div>
    );
}

export default FlightSearch;

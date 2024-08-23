import React, { useState } from 'react';
import Autocomplete from './Autocomplete'; // Asegúrate de que la ruta sea correcta

function FlightSearch() {
    const [selectedOrigin, setSelectedOrigin] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [departureDate, setDepartureDate] = useState('');
    const [results, setResults] = useState(null);

    const handleSearch = (event) => {
        event.preventDefault();

        // Mostrar en la consola los valores actuales
        console.log("Selected Origin:", selectedOrigin);
        console.log("Selected Destination:", selectedDestination);
        console.log("Departure Date:", departureDate);

        if (!selectedOrigin?.iata_code || !selectedDestination?.iata_code || !departureDate) {
            setResults({
                code: "missing_params",
                message: "Faltan algunos parámetros requeridos (origin, destination, departure_date).",
                data: null
            });
            return;
        }

        const searchParams = {
            origin: selectedOrigin.iata_code,
            destination: selectedDestination.iata_code,
            departure_date: departureDate
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
        <div style={{ position: 'relative', maxWidth: '600px', margin: 'auto' }}>
            <h2>Busca tu vuelo</h2>
            <form onSubmit={handleSearch}>
                <div style={{ marginBottom: '20px' }}>
                    <label>Origen</label>
                    <Autocomplete
                        label="Origen"
                        placeholder="Ingresa una ciudad, aeropuerto o código IATA"
                        onSelect={setSelectedOrigin} // Aquí se recibe la ubicación seleccionada
                        fetchOptions={{
                            url: '/wp-json/duffel/v1/proxy-locations',
                            queryParam: 'query',
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label>Destino</label>
                    <Autocomplete
                        label="Destino"
                        placeholder="Ingresa una ciudad, aeropuerto o código IATA"
                        onSelect={setSelectedDestination} // Aquí se recibe la ubicación seleccionada
                        fetchOptions={{
                            url: '/wp-json/duffel/v1/proxy-locations',
                            queryParam: 'query',
                        }}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label>Fecha de salida</label>
                    <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Buscar
                </button>
            </form>
            {results && <pre>{JSON.stringify(results, null, 2)}</pre>}
        </div>
    );
}

export default FlightSearch;

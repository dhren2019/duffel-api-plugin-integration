import React, { useState } from 'react';
import Autocomplete from './duffel/Autocomplete'; // Adjust the path according to the location of the component

function FlightSearch() {
    const [selectedOrigin, setSelectedOrigin] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    console.log('setSelectedDestination:', setSelectedDestination);
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [results, setResults] = useState(null);
    const [journeyType, setJourneyType] = useState('one-way');
    const [flights, setFlights] = useState([{ origin: null, destination: null, departureDate: '' }]);
    

    const handleJourneyTypeChange = (e) => {
        setJourneyType(e.target.value);
        if (e.target.value === 'one-way') {
            setFlights([{ origin: null, destination: null, departureDate: '' }]);
            setReturnDate('');
        } else if (e.target.value === 'round-trip') {
            setFlights([{ origin: null, destination: null, departureDate: '', returnDate: '' }]);
        } else if (e.target.value === 'multi-city') {
            setFlights([{ origin: null, destination: null, departureDate: '' }]);
        }
    };

    const addFlight = () => {
        setFlights([...flights, { origin: null, destination: null, departureDate: '' }]);
    };

    const removeFlight = (index) => {
        const newFlights = [...flights];
        newFlights.splice(index, 1);
        setFlights(newFlights);
    };

    const handleSearch = (event) => {
        event.preventDefault();

        if (journeyType === 'multi-city') {
            const missingParams = flights.some(flight => !flight.origin?.iata_code || !flight.destination?.iata_code || !flight.departureDate);
            if (missingParams) {
                setResults({
                    code: "missing_params",
                    message: "Faltan algunos parámetros requeridos en uno o más vuelos.",
                    data: null
                });
                return;
            }
        } else {
            if (!selectedOrigin?.iata_code || !selectedDestination?.iata_code || !departureDate || (journeyType === 'round-trip' && !returnDate)) {
                setResults({
                    code: "missing_params",
                    message: "Faltan algunos parámetros requeridos (origin, destination, departure_date).",
                    data: null
                });
                return;
            }
        }

        const searchParams = journeyType === 'multi-city' 
            ? flights.map(flight => ({
                origin: flight.origin.iata_code,
                destination: flight.destination.iata_code,
                departure_date: flight.departureDate
            }))
            : {
                origin: selectedOrigin.iata_code,
                destination: selectedDestination.iata_code,
                departure_date: departureDate,
                ...(journeyType === 'round-trip' && { return_date: returnDate })
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

    const handleSelect = (location, type) => {
        if (location && location.iata_code && location.name) {
            if (type === 'origin') {
                setSelectedOrigin(location);
            } else {
                setSelectedDestination(location);
            }
            setTimeout(() => {
                document.activeElement.blur();  // Esto ayuda a cerrar el desplegable de autocompletar
            }, 0);
        } else {
            console.error('Datos de ubicación inválidos:', location);
        }
    };
    
    
    return (
        <div style={{ position: 'relative', maxWidth: '600px', margin: 'auto' }}>
            <h2>Busca tu vuelo</h2>
            <form onSubmit={handleSearch}>
                <div style={{ marginBottom: '20px' }}>
                    <label>Tipo de viaje</label><br/>
                    <input type="radio" value="one-way" checked={journeyType === 'one-way'} onChange={handleJourneyTypeChange}/> Solo ida
                    <input type="radio" value="round-trip" checked={journeyType === 'round-trip'} onChange={handleJourneyTypeChange}/> Ida y vuelta
                    <input type="radio" value="multi-city" checked={journeyType === 'multi-city'} onChange={handleJourneyTypeChange}/> Multidestino
                </div>
    
                {journeyType === 'multi-city' ? (
                    flights.map((flight, index) => (
                        <div key={index} style={{ marginBottom: '20px' }}>
                            <h3>Vuelo {index + 1}</h3>
                            <label>Origen</label>
                            <Autocomplete
                                label="Origen"
                                placeholder="Ingresa una ciudad, aeropuerto o código IATA"
                                onSelect={(location) => {
                                    const newFlights = [...flights];
                                    newFlights[index].origin = location;
                                    setFlights(newFlights);
                                    handleSelect(location, 'origin');  // Call handleSelect to close the autocomplete
                                }}
                                fetchOptions={{
                                    url: '/wp-json/duffel/v1/proxy-locations',
                                    queryParam: 'query',
                                }}
                            />
                            <label>Destino</label>
                            <Autocomplete
                                label="Destino"
                                placeholder="Ingresa una ciudad, aeropuerto o código IATA"
                                onSelect={(location) => {
                                    const newFlights = [...flights];
                                    newFlights[index].destination = location;
                                    setFlights(newFlights);
                                    handleSelect(location, 'destination');  // Call handleSelect to close the autocomplete
                                }}
                                fetchOptions={{
                                    url: '/wp-json/duffel/v1/proxy-locations',
                                    queryParam: 'query',
                                }}
                            />
                            <label>Fecha de salida</label>
                            <input
                                type="date"
                                value={flight.departureDate}
                                onChange={(e) => {
                                    const newFlights = [...flights];
                                    newFlights[index].departureDate = e.target.value;
                                    setFlights(newFlights);
                                }}
                                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                            />
                            {index > 0 && (
                                <button type="button" onClick={() => removeFlight(index)}>Eliminar vuelo</button>
                            )}
                        </div>
                    ))
                ) : (
                    <>
                        <div style={{ marginBottom: '20px' }}>
                            <label>Origen</label>
                            <Autocomplete
                                label="Origen"
                                placeholder="Ingresa una ciudad, aeropuerto o código IATA"
                                onSelect={(location) => handleSelect(location, 'origin')}
                                fetchOptions={{
                                    url: '/wp-json/duffel/v1/proxy-locations',
                                    queryParam: 'query',
                                }}
                            />
                            {selectedOrigin && (
                                <input
                                    type="text"
                                    value={`${selectedOrigin.iata_code} - ${selectedOrigin.name}`}
                                    readOnly
                                    placeholder="Selecciona un origen"
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            )}
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label>Destino</label>
                            <Autocomplete
                                label="Destino"
                                placeholder="Ingresa una ciudad, aeropuerto o código IATA"
                                onSelect={(location) => handleSelect(location, 'destination')}
                                fetchOptions={{
                                    url: '/wp-json/duffel/v1/proxy-locations',
                                    queryParam: 'query',
                                }}
                            />
                            {selectedDestination && (
                                <input
                                    type="text"
                                    value={`${selectedDestination.iata_code} - ${selectedDestination.name}`}
                                    readOnly
                                    placeholder="Selecciona un destino"
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            )}
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
                        {journeyType === 'round-trip' && (
                            <div style={{ marginBottom: '20px' }}>
                                <label>Fecha de regreso</label>
                                <input
                                    type="date"
                                    value={returnDate}
                                    onChange={(e) => setReturnDate(e.target.value)}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>
                        )}
                    </>
                )}
    
                {journeyType === 'multi-city' && (
                    <button type="button" onClick={addFlight}>Añadir otro vuelo</button>
                )}
    
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: 'black', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Buscar
                </button>
            </form>
            {results && <pre>{JSON.stringify(results, null, 2)}</pre>}
        </div>
    );
}

export default FlightSearch;

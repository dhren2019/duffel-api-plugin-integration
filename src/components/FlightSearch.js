import React, { useState, useEffect, useRef } from 'react';
import Autocomplete from './duffel/Autocomplete';

function FlightSearch() {
    const [selectedOrigin, setSelectedOrigin] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [results, setResults] = useState(null);
    const [journeyType, setJourneyType] = useState('one-way');
    const [flights, setFlights] = useState([{ origin: null, destination: null, departureDate: '' }]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [dropdownRef]);

    const handleJourneyTypeChange = (e) => {
        setJourneyType(e.target.value);
        if (e.target.value === 'one-way') {
            setFlights([{ origin: null, destination: null, departureDate: '' }]);
            setReturnDate('');
        } else if (e.target.value === 'round-trip') {
            setFlights([{ origin: null, destination: null, departureDate: '', returnDate: '' }]);
            setReturnDate(''); // Mantener limpio hasta que se seleccione una fecha
        } else if (e.target.value === 'multi-city') {
            setFlights([{ origin: null, destination: null, departureDate: '' }]);
        }
    };

    const addFlight = () => {
        const lastFlight = flights[flights.length - 1];
        if (lastFlight.origin && lastFlight.destination && lastFlight.departureDate) {
            setFlights([...flights, { origin: null, destination: null, departureDate: '' }]);
        } else {
            alert("Por favor, completa los detalles del vuelo actual antes de añadir otro vuelo.");
        }
    };

    const removeFlight = (index) => {
        const newFlights = [...flights];
        newFlights.splice(index, 1);
        setFlights(newFlights);
    };

    const handleSearch = (event) => {
        event.preventDefault();
    
        // Validación para "multi-city"
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
            // Validación para "one-way" y "round-trip"
            if (!selectedOrigin?.iata_code || !selectedDestination?.iata_code || !departureDate || (journeyType === 'round-trip' && !returnDate)) {
                setResults({
                    code: "missing_params",
                    message: "Faltan algunos parámetros requeridos (origin, destination, departure_date).",
                    data: null
                });
                return;
            }
        }
    
        // Configuración de los parámetros de búsqueda
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
    
        // Depuración para asegurar que los parámetros son correctos
        console.log('Enviando búsqueda con estos parámetros:', searchParams);
    
        // Hacer la solicitud
        fetch('/wp-json/duffel/v1/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchParams)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Resultados obtenidos:', data);
            setResults(data);
        })
        .catch(error => console.error('Error en la búsqueda:', error));
    };
    

    const handleSelect = (location, type, index) => {
        if (location && location.iata_code && location.name) {
            const newFlights = [...flights];

            if (index !== undefined) {
                if (type === 'origin') {
                    newFlights[index].origin = location;
                } else if (type === 'destination') {
                    newFlights[index].destination = location;
                }
            } else {
                if (type === 'origin') {
                    setSelectedOrigin(location);
                } else if (type === 'destination') {
                    setSelectedDestination(location);
                }
            }

            setFlights(newFlights);
            setIsDropdownVisible(false);
        } else {
            console.error('Datos de ubicación inválidos:', location);
        }
    };

    const handleFocus = () => {
        if (!isDropdownVisible) {
            setIsDropdownVisible(true);
        }
    };
    
    return (
        <div className="flight-search-container">
            <form onSubmit={handleSearch}>
                {/* Primera fila: Tipo de viaje */}
                <div className="journey-type-options">
                    <label>
                        <input
                            type="radio"
                            value="one-way"
                            checked={journeyType === 'one-way'}
                            onChange={handleJourneyTypeChange}
                        />
                        One way
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="round-trip"
                            checked={journeyType === 'round-trip'}
                            onChange={handleJourneyTypeChange}
                        />
                        Return
                    </label>
                    <label>
                        <input
                            type="radio"
                            value="multi-city"
                            checked={journeyType === 'multi-city'}
                            onChange={handleJourneyTypeChange}
                        />
                        Multi-city
                    </label>
                </div>
    
                {/* Segunda fila: Origen y Destino */}
                <div className="form-field">
                    <label>Origin</label>
                    <Autocomplete
                        placeholder="Enter a city or airport"
                        onSelect={(location) => handleSelect(location, 'origin')}
                        fetchOptions={{
                            url: '/wp-json/duffel/v1/proxy-locations',
                            queryParam: 'query',
                        }}
                    />
                </div>
                <div className="form-field">
                    <label>Destination</label>
                    <Autocomplete
                        placeholder="Enter a city or airport"
                        onSelect={(location) => handleSelect(location, 'destination')}
                        fetchOptions={{
                            url: '/wp-json/duffel/v1/proxy-locations',
                            queryParam: 'query',
                        }}
                    />
                </div>
    
                {/* Tercera fila: Fecha de salida y, si aplica, Fecha de regreso */}
                <div className="form-field half-width">
                    <label>Departure date</label>
                    <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} />
                </div>
    
                {journeyType === 'round-trip' && (
                    <div className="form-field half-width">
                        <label>Return date</label>
                        <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
                    </div>
                )}
    
                {/* Botón de búsqueda */}
                <button type="submit">Find available flights</button>
            </form>
    
            {/* Mostrar los resultados */}
            {results && (
                <div className="results-container">
                    <h3>Search Results:</h3>
                    <pre>{JSON.stringify(results, null, 2)}</pre> {/* Esto renderiza los resultados en formato JSON */}
                </div>
            )}
        </div>
    );    
}
export default FlightSearch;

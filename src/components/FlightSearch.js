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
    
    // Estado para pasajeros y clase
    const [selectedPassengers, setSelectedPassengers] = useState('1 adult');
    const [selectedClass, setSelectedClass] = useState('Economy');

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
    
        // Convertir el valor de selectedPassengers en un array de objetos entendible para la API
        const passengers = [];
        if (selectedPassengers === "1 adult") {
            passengers.push({ type: "adult" });
        } else if (selectedPassengers === "2 adults") {
            passengers.push({ type: "adult" }, { type: "adult" });
        } else if (selectedPassengers === "1 adult, 1 child") {
            passengers.push({ type: "adult" }, { type: "child" });
        }
    
        // Configuración de los parámetros de búsqueda incluyendo pasajeros y clase
        const searchParams = journeyType === 'multi-city' 
            ? flights.map(flight => ({
                origin: flight.origin.iata_code,
                destination: flight.destination.iata_code,
                departure_date: flight.departureDate,
                passengers: passengers, // Número de pasajeros
                cabin_class: selectedClass // Tipo de clase
            }))
            : {
                origin: selectedOrigin.iata_code,
                destination: selectedDestination.iata_code,
                departure_date: departureDate,
                ...(journeyType === 'round-trip' && { return_date: returnDate }),
                passengers: passengers, // Número de pasajeros
                cabin_class: selectedClass // Tipo de clase
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
    
            // Si el resultado contiene información de precio, mostrarla en el log
            if (data && data.data && data.data.offers) {
                data.data.offers.forEach((offer, index) => {
                    console.log(`Oferta ${index + 1}: Precio: ${offer.total_amount} ${offer.total_currency}`);
                    console.log(`Clase: ${selectedClass}, Pasajeros: ${JSON.stringify(passengers)}`);
                });
            }
    
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
                <div className="form-row">
                    <div className="form-field half-width">
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
                    <div className="form-field half-width">
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
                </div>
    
                {/* Tercera fila: Fecha de salida y, si aplica, Fecha de regreso */}
                <div className="form-row">
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
                </div>

                {/* Cuarta fila: Pasajeros y clase */}
                <div className="form-row">
                    <div className="form-field half-width">
                        <label>Passengers</label>
                        <select value={selectedPassengers} onChange={(e) => setSelectedPassengers(e.target.value)}>
                            <option value="1 adult">1 adult</option>
                            <option value="2 adults">2 adults</option>
                            <option value="1 adult, 1 child">1 adult, 1 child</option>
                            {/* Añade más opciones según necesites */}
                        </select>
                    </div>

                    <div className="form-field half-width">
                        <label>Class</label>
                        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                            <option value="Economy">Economy</option>
                            <option value="Premium Economy">Premium Economy</option>
                            <option value="Business">Business</option>
                            <option value="First">First</option>
                            <option value="Any">Any</option>
                        </select>
                    </div>
                </div>

                <div className="advanced-options">
                    Advanced options
                </div>
    
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

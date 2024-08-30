// FlightSearch.js
import React, { useState, useEffect, useRef } from 'react';
import Autocomplete from './duffel/Autocomplete';
import FlightCard from './FlightCard';

function FlightSearch() {
    const [selectedOrigin, setSelectedOrigin] = useState(null);
    const [selectedDestination, setSelectedDestination] = useState(null);
    const [departureDate, setDepartureDate] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [results, setResults] = useState(null);
    const [passengers, setPassengers] = useState([{ type: "adult" }]);
    const [journeyType, setJourneyType] = useState('one-way');
    const [flights, setFlights] = useState([{ origin: null, destination: null, departureDate: '' }]);
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [selectedPassengers, setSelectedPassengers] = useState('1 adult');
    const [selectedClass, setSelectedClass] = useState('Economy');
    const [adultCount, setAdultCount] = useState(1);
    const [childCount, setChildCount] = useState(0);
    const [showResults, setShowResults] = useState(false); // Estado para controlar la vista de resultados
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
        const newJourneyType = e.target.value;
        setJourneyType(newJourneyType);
    
        if (newJourneyType === 'one-way') {
            setFlights([{ origin: null, destination: null, departureDate: '' }]);
            setReturnDate('');
        } else if (newJourneyType === 'round-trip') {
            setFlights([{ origin: null, destination: null, departureDate: '', returnDate: '' }]);
            setReturnDate('');
        } else if (newJourneyType === 'multi-city') {
            setFlights([{ origin: null, destination: null, departureDate: '' }]);
        }
    };

    const handleSearch = (event) => {
        event.preventDefault();
        setResults(null);

        // Validaciones y configuración de los parámetros de búsqueda
        if (journeyType === 'multi-city') {
            const missingParams = flights.some(
                (flight) => !flight.origin?.iata_code || !flight.destination?.iata_code || !flight.departureDate
            );
            if (missingParams) {
                setResults({
                    code: "missing_params",
                    message: "Faltan algunos parámetros requeridos en uno o más vuelos.",
                    data: null,
                });
                return;
            }
        } else {
            if (!selectedOrigin?.iata_code || !selectedDestination?.iata_code || !departureDate || 
                (journeyType === 'round-trip' && !returnDate)) {
                setResults({
                    code: "missing_params",
                    message: "Faltan algunos parámetros requeridos (origin, destination, departure_date).",
                    data: null,
                });
                return;
            }
        }

        // Configuración de los parámetros de búsqueda incluyendo pasajeros y clase
        const passengers = [];
        if (selectedPassengers === "1 adult") {
            passengers.push({ type: "adult" });
        } else if (selectedPassengers === "2 adults") {
            passengers.push({ type: "adult" }, { type: "adult" });
        } else if (selectedPassengers === "1 adult, 1 child") {
            passengers.push({ type: "adult" }, { type: "child" });
        }

        const searchParams = journeyType === 'multi-city'
            ? flights.map((flight) => ({
                origin: flight.origin.iata_code,
                destination: flight.destination.iata_code,
                departure_date: flight.departureDate,
                passengers: passengers,
                cabin_class: selectedClass,
            }))
            : {
                origin: selectedOrigin.iata_code,
                destination: selectedDestination.iata_code,
                departure_date: departureDate,
                ...(journeyType === 'round-trip' && { return_date: returnDate }),
                passengers: passengers,
                cabin_class: selectedClass,
            };

        // Realizar la búsqueda
        fetch('/wp-json/duffel/v1/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchParams),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error en la solicitud: ' + response.statusText);
            }
            return response.json();
        })
        .then((data) => {
            setResults(data);
            setShowResults(true); // Cambiar a la vista de resultados
        })
        .catch((error) => {
            console.error('Error en la búsqueda:', error);
            setResults({
                code: "fetch_error",
                message: "Error al realizar la búsqueda. Verifica la consola para más detalles.",
                data: null,
            });
        });
    };

    const handleSelect = (location, type, index) => {
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
    };

    const updatePassengerLabel = (adults, children) => {
        let label = `${adults} adult${adults > 1 ? 's' : ''}`;
        if (children > 0) {
            label += `, ${children} child${children > 1 ? 'ren' : ''}`;
        }
        setSelectedPassengers(label);
    };

    const incrementAdult = () => {
        setAdultCount(adultCount + 1);
        updatePassengerLabel(adultCount + 1, childCount);
    };

    const decrementAdult = () => {
        if (adultCount > 1) {
            setAdultCount(adultCount - 1);
            updatePassengerLabel(adultCount - 1, childCount);
        }
    };

    const incrementChild = () => {
        setChildCount(childCount + 1);
        updatePassengerLabel(adultCount, childCount + 1);
    };

    const decrementChild = () => {
        if (childCount > 0) {
            setChildCount(childCount - 1);
            updatePassengerLabel(adultCount, childCount - 1);
        }
    };

    return (
        <div className="flight-search-container">
            {!showResults ? (
                <form onSubmit={handleSearch}>
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

                    <div className="form-row">
                        <div className="form-field half-width" ref={dropdownRef}>
                            <label>Passengers</label>
                            <div
                                className="passenger-selector"
                                onClick={() => setIsDropdownVisible((prev) => !prev)}
                            >
                                {selectedPassengers}
                            </div>
                            {isDropdownVisible && (
                                <div className="passenger-dropdown">
                                    <div className="passenger-counter">
                                        <label>Adults</label>
                                        <span>18+</span>
                                        <div className="counter-controls">
                                            <button type="button" onClick={decrementAdult}>-</button>
                                            <span>{adultCount}</span>
                                            <button type="button" onClick={incrementAdult}>+</button>
                                        </div>
                                    </div>
                                    <div className="passenger-counter">
                                        <label>Children</label>
                                        <span>0-17</span>
                                        <div className="counter-controls">
                                            <button type="button" onClick={decrementChild}>-</button>
                                            <span>{childCount}</span>
                                            <button type="button" onClick={incrementChild}>+</button>
                                        </div>
                                    </div>
                                </div>
                            )}
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

                    <button type="submit">Find available flights</button>
                </form>
            ) : (
                <div className="container">
                    <div className="menu">
                        <p>Filtros de búsqueda</p>
                        {/* Aquí puedes agregar más filtros según sea necesario */}
                    </div>
                    <div className="content">
                        <h3>Resultados de la búsqueda:</h3>
                        <div className="flight-cards-container">
                            {results.data.offers.map((offer, index) => (
                                <FlightCard
                                    key={index}
                                    offer={offer}
                                    selectedClass={selectedClass}
                                    passengers={passengers}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FlightSearch;

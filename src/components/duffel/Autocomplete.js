import React, { useState, useEffect } from 'react';

const Autocomplete = ({ label, placeholder, onSelect, fetchOptions }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);

    useEffect(() => {
        if (query.length >= 3) {
            const url = `${fetchOptions.url}?${fetchOptions.queryParam}=${encodeURIComponent(query)}`;

            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    console.log("Datos recibidos:", data);
                    setResults(data.data || []);
                    setDropdownVisible(true); // Muestra el desplegable
                })
                .catch((error) => console.error('Error fetching locations:', error));
        } else {
            setResults([]);
            setDropdownVisible(false); // Oculta el desplegable si la consulta es demasiado corta
        }
    }, [query, fetchOptions]);

    const handleSelect = (location) => {
        onSelect(location);
        setQuery(`${location.city_name} (${location.iata_code}) - ${location.name}`);
        setDropdownVisible(false); // Cierra el desplegable
        setTimeout(() => {
            document.activeElement.blur(); // Fuerza el foco fuera del input
        }, 0);
    };

    return (
        <div style={{ position: 'relative' }}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                onFocus={() => setDropdownVisible(true)} // Abre el desplegable al enfocar
            />
            {isDropdownVisible && results.length > 0 && (
                <ul className="autocomplete-list" style={{ position: 'absolute', top: '100%', left: 0, width: '100%', border: '1px solid #ccc', zIndex: 1000, backgroundColor: 'white', maxHeight: '200px', overflowY: 'auto' }}>
                    {results.map((location) => (
                        <li
                            key={location.id}
                            onClick={() => handleSelect(location)}
                            style={{ padding: '8px', cursor: 'pointer' }}
                        >
                            {location.city_name} ({location.iata_code}) - {location.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Autocomplete;

import React, { useState, useEffect } from 'react';

const Autocomplete = ({ label, placeholder, onSelect, fetchOptions }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (query.length >= 3) {
            const url = `${fetchOptions.url}?${fetchOptions.queryParam}=${encodeURIComponent(query)}`;
    
            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    console.log("Datos recibidos:", data); // Asegúrate de que estás recibiendo los datos esperados
                    setResults(data.data || []);
                })
                .catch((error) => console.error('Error fetching locations:', error));
        } else {
            setResults([]);
        }
    }, [query, fetchOptions]);
    

    const handleSelect = (location) => {
        console.log("Location seleccionada:", location); // Deberías ver esto cuando haces clic en una opción
        onSelect({
            iata_code: location.iata_code,
            name: `${location.city_name} (${location.iata_code}) - ${location.name}`,
        });
        setQuery(`${location.city_name} (${location.iata_code}) - ${location.name}`);
        setResults([]);
    };
    

    return (
        <div style={{ position: 'relative' }}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
            {results.length > 0 && (
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

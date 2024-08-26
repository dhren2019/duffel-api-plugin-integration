import React, { useState, useEffect, useRef } from 'react';

const Autocomplete = ({ label, placeholder, onSelect, fetchOptions }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isDropdownVisible, setDropdownVisible] = useState(false);
    const [selectionMade, setSelectionMade] = useState(false); // Nuevo estado para rastrear si se hizo una selección
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (query.length >= 3 && !selectionMade) { // Evitar búsqueda si se hizo una selección
            console.log('Buscando datos para:', query);
            const url = `${fetchOptions.url}?${fetchOptions.queryParam}=${encodeURIComponent(query)}`;

            fetch(url)
                .then((response) => response.json())
                .then((data) => {
                    console.log('Datos recibidos:', data);
                    setResults(data.data || []);
                    setDropdownVisible(data.data.length > 0);
                })
                .catch((error) => console.error('Error fetching locations:', error));
        } else {
            console.log('Consulta demasiado corta o vacía, o selección hecha. Ocultando dropdown.');
            setResults([]);
            setDropdownVisible(false);
        }
    }, [query, fetchOptions, selectionMade]);

    useEffect(() => {
        if (!isDropdownVisible && dropdownRef.current) {
            dropdownRef.current.classList.add('hidden');
        } else if (isDropdownVisible && dropdownRef.current) {
            dropdownRef.current.classList.remove('hidden');
        }
    }, [isDropdownVisible]);

    const handleSelect = (location) => {
        console.log('Elemento seleccionado:', location);
        if (location && location.iata_code && location.name) {
            onSelect(location);
            setQuery(`${location.city_name} (${location.iata_code}) - ${location.name}`);
            setSelectionMade(true); // Marcar que se ha hecho una selección
            setResults([]);
            setDropdownVisible(false); // Asegurarse de que el dropdown se cierre
        } else {
            console.error('Datos de ubicación inválidos:', location);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        setSelectionMade(false);

        const isValidSelection = results.some(
            (location) => `${location.city_name} (${location.iata_code}) - ${location.name}` === value
        );

        if (value.length < 3 || isValidSelection) {
            setDropdownVisible(false);
        } else {
            setDropdownVisible(results.length > 0);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder={placeholder}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                onFocus={() => {
                    if (query.length >= 3 && results.length > 0 && !selectionMade) {
                        setDropdownVisible(true);
                    }
                }}
            />
            <ul
                className={`autocomplete-list ${!isDropdownVisible ? 'hidden' : ''}`}
                ref={dropdownRef}
            >
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
        </div>
    );
};

export default Autocomplete;

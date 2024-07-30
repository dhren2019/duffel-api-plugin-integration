document.addEventListener('DOMContentLoaded', function() {
    function toggleReturnDateField() {
        var tripType = document.getElementById('trip_type').value;
        var returnDateGroup = document.getElementById('return-date-group');
        if (tripType === 'return') {
            returnDateGroup.style.display = 'block';
        } else {
            returnDateGroup.style.display = 'none';
        }
    }

    document.getElementById('trip_type').addEventListener('change', toggleReturnDateField);
    toggleReturnDateField(); // Llamar para establecer el estado inicial

    document.getElementById('next-to-step-2').addEventListener('click', function() {
        document.getElementById('step-1').style.display = 'none';
        document.getElementById('step-2').style.display = 'block';
        loadOutboundFlights();
    });

    document.getElementById('next-to-step-3').addEventListener('click', function() {
        document.getElementById('step-2').style.display = 'none';
        document.getElementById('step-3').style.display = 'block';
        loadReturnFlights();
    });

    function formatTime(dateTimeString) {
        const date = new Date(dateTimeString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function formatDuration(duration) {
        if (!duration) return 'N/A';
        const match = duration.match(/PT(\d+H)?(\d+M)?/);
        if (!match) return 'N/A';
        const hours = match[1] ? match[1].replace('H', ' h ') : '';
        const minutes = match[2] ? match[2].replace('M', ' m') : '';
        return (hours + minutes).trim();
    }

    function loadOutboundFlights() {
        var origin = document.getElementById('origin').value;
        var destination = document.getElementById('destination').value;
        var departureDate = document.getElementById('departure_date').value;

        fetch(`${ajaxurl}?action=duffel_search_flights&origin=${origin}&destination=${destination}&departure_date=${departureDate}`)
            .then(response => response.json())
            .then(data => {
                console.log('API Response Data:', data);  // Registrar la respuesta completa de la API
                var outboundFlightsContainer = document.getElementById('outbound-flights');
                outboundFlightsContainer.innerHTML = '';

                if (data.error) {
                    console.error('Error from API:', data.error);
                    console.error('Raw response:', data.response);
                    outboundFlightsContainer.innerHTML = `<p>Error loading outbound flights. ${data.error}</p><pre>${data.response}</pre>`;
                    return;
                }

                if (data.length > 0) {
                    data.forEach(flight => {
                        var slice = flight.slices && flight.slices[0];
                        if (!slice || !slice.segments || slice.segments.length === 0) {
                            console.error('Invalid slice data:', slice);
                            return;
                        }
                        var segment = slice.segments[0];
                        var flightDiv = document.createElement('div');
                        flightDiv.classList.add('flight');
                        flightDiv.innerHTML = `
                            <img class="airline-logo" src="${segment.operating_carrier.logo_symbol_url || 'default-logo.png'}" alt="${segment.operating_carrier.name || 'Logo'}">
                            <div class="flight-details">
                                <div class="flight-times">
                                    <span>${formatTime(segment.departing_at)}</span>
                                    <span>${formatDuration(slice.duration)}</span>
                                    <span>${formatTime(segment.arriving_at)}</span>
                                </div>
                                <div class="flight-airports">
                                    <span>${slice.origin.iata_code}</span>
                                    <span>${slice.segments.length - 1 === 0 ? 'Directo' : `${slice.segments.length - 1} parada(s)`}</span>
                                    <span>${slice.destination.iata_code}</span>
                                </div>
                                <div class="flight-price">
                                    <p>Desde €${flight.total_amount || 'N/A'} ${flight.total_currency || ''}</p>
                                </div>
                            </div>
                            <div class="flight-select">
                                <button>Seleccionar</button>
                            </div>
                        `;
                        outboundFlightsContainer.appendChild(flightDiv);
                    });

                    document.getElementById('next-to-step-3').style.display = 'block';
                } else {
                    outboundFlightsContainer.innerHTML = '<p>No outbound flights found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching outbound flights:', error);
                document.getElementById('outbound-flights').innerHTML = '<p>Error loading outbound flights. Please try again.</p>';
            });
    }

    function loadReturnFlights() {
        var origin = document.getElementById('origin').value;
        var destination = document.getElementById('destination').value;
        var returnDate = document.getElementById('return_date').value;

        fetch(`${ajaxurl}?action=duffel_search_flights&origin=${destination}&destination=${origin}&departure_date=${returnDate}`)
            .then(response => response.json())
            .then(data => {
                console.log('API Response Data:', data);  // Registrar la respuesta completa de la API
                var returnFlightsContainer = document.getElementById('return-flights');
                returnFlightsContainer.innerHTML = '';

                if (data.error) {
                    console.error('Error from API:', data.error);
                    console.error('Raw response:', data.response);
                    returnFlightsContainer.innerHTML = `<p>Error loading return flights. ${data.error}</p><pre>${data.response}</pre>`;
                    return;
                }

                if (data.length > 0) {
                    data.forEach(flight => {
                        var slice = flight.slices && flight.slices[0];
                        if (!slice || !slice.segments || slice.segments.length === 0) {
                            console.error('Invalid slice data:', slice);
                            return;
                        }
                        var segment = slice.segments[0];
                        var flightDiv = document.createElement('div');
                        flightDiv.classList.add('flight');
                        flightDiv.innerHTML = `
                            <img class="airline-logo" src="${segment.operating_carrier.logo_symbol_url || 'default-logo.png'}" alt="${segment.operating_carrier.name || 'Logo'}">
                            <div class="flight-details">
                                <div class="flight-times">
                                    <span>${formatTime(segment.departing_at)}</span>
                                    <span>${formatDuration(slice.duration)}</span>
                                    <span>${formatTime(segment.arriving_at)}</span>
                                </div>
                                <div class="flight-airports">
                                    <span>${slice.origin.iata_code}</span>
                                    <span>${slice.segments.length - 1 === 0 ? 'Directo' : `${slice.segments.length - 1} parada(s)`}</span>
                                    <span>${slice.destination.iata_code}</span>
                                </div>
                                <div class="flight-price">
                                    <p>Desde €${flight.total_amount || 'N/A'} ${flight.total_currency || ''}</p>
                                </div>
                            </div>
                            <div class="flight-select">
                                <button>Seleccionar</button>
                            </div>
                        `;
                        returnFlightsContainer.appendChild(flightDiv);
                    });
                } else {
                    returnFlightsContainer.innerHTML = '<p>No return flights found.</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching return flights:', error);
                document.getElementById('return-flights').innerHTML = '<p>Error loading return flights. Please try again.</p>';
            });
    }
});

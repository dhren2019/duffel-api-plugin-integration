document.addEventListener('DOMContentLoaded', function() {
    var selectedOutboundFlight = null;

    function toggleReturnDateField() {
        var tripType = document.getElementById('trip_type').value;
        var returnDateGroup = document.getElementById('return-date-group');
        returnDateGroup.style.display = tripType === 'return' ? 'block' : 'none';
    }

    document.getElementById('trip_type').addEventListener('change', toggleReturnDateField);
    toggleReturnDateField(); // Llamar para establecer el estado inicial

    document.getElementById('next-to-step-2').addEventListener('click', function() {
        document.getElementById('step-1').style.display = 'none';
        document.getElementById('step-2').style.display = 'block';
        loadOutboundFlights();
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

    function addToCartAndCheckout(flightDetails) {
        console.log('Sending flight details:', flightDetails); // Log para depuración
        fetch(ajaxurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'add_flight_to_cart',
                flight_details: flightDetails
            })
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                window.location.href = '/cart'; // Redirigir al checkout de WooCommerce
            } else {
                console.error('Error response from server:', data);
                alert('Error al añadir el vuelo al carrito.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al procesar la solicitud.');
        });
    }
    

    function handleFlightSelection(flightDetails) {
        var tripType = document.getElementById('trip_type').value;

        if (tripType === 'oneway') {
            addToCartAndCheckout(flightDetails);
        } else if (tripType === 'return') {
            if (!selectedOutboundFlight) {
                selectedOutboundFlight = flightDetails;
                document.getElementById('step-2').style.display = 'none';
                document.getElementById('step-3').style.display = 'block';
                loadReturnFlights();
            } else {
                addToCartAndCheckout({ 
                    outbound: selectedOutboundFlight, 
                    return: flightDetails 
                });
            }
        }
    }

    function loadOutboundFlights() {
        var origin = document.getElementById('origin').value;
        var destination = document.getElementById('destination').value;
        var departureDate = document.getElementById('departure_date').value;

        fetch(`${ajaxurl}?action=duffel_search_flights&origin=${origin}&destination=${destination}&departure_date=${departureDate}`)
            .then(response => response.json())
            .then(data => {
                console.log('API Response Data:', data);
                var outboundFlightsContainer = document.getElementById('outbound-flights');
                outboundFlightsContainer.innerHTML = '';

                if (data.error) {
                    console.error('Error from API:', data.error);
                    outboundFlightsContainer.innerHTML = `<p>Error loading outbound flights. ${data.error}</p>`;
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
                                <button 
                                    data-flight-number="${segment.operating_carrier_flight_number || 'undefined'}"
                                    data-price="${flight.total_amount || 'undefined'}"
                                    data-description="Vuelo de ${slice.origin.iata_code} a ${slice.destination.iata_code} el ${formatTime(segment.departing_at)}"
                                >
                                    Seleccionar
                                </button>
                            </div>
                        `;
                        flightDiv.querySelector('.flight-select button').addEventListener('click', function() {
                            var flightDetails = {
                                flight_number: this.dataset.flightNumber,
                                price: this.dataset.price,
                                description: this.dataset.description
                            };
                            console.log('Flight details:', flightDetails); // Log para depuración
                            handleFlightSelection(flightDetails);
                        });
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
                console.log('API Response Data:', data);
                var returnFlightsContainer = document.getElementById('return-flights');
                returnFlightsContainer.innerHTML = '';

                if (data.error) {
                    console.error('Error from API:', data.error);
                    returnFlightsContainer.innerHTML = `<p>Error loading return flights. ${data.error}</p>`;
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
                                <button 
                                    data-flight-number="${segment.operating_carrier_flight_number || 'undefined'}"
                                    data-price="${flight.total_amount || 'undefined'}"
                                    data-description="Vuelo de ${slice.origin.iata_code} a ${slice.destination.iata_code} el ${formatTime(segment.departing_at)}"
                                >
                                    Seleccionar
                                </button>
                            </div>
                        `;
                        flightDiv.querySelector('.flight-select button').addEventListener('click', function() {
                            var flightDetails = {
                                flight_number: this.dataset.flightNumber,
                                price: this.dataset.price,
                                description: this.dataset.description
                            };
                            console.log('Flight details:', flightDetails); // Log para depuración
                            handleFlightSelection(flightDetails);
                        });
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

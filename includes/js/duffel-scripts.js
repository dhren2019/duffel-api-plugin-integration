document.addEventListener('DOMContentLoaded', function() {
    var selectedOutboundFlight = null;
    var selectedReturnFlight = null;

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

    function handleFlightSelection(flightDetails) {
        var tripType = document.getElementById('trip_type').value;

        if (tripType === 'oneway') {
            selectedOutboundFlight = flightDetails;
            showItinerarySummary();
        } else if (tripType === 'return') {
            if (!selectedOutboundFlight) {
                selectedOutboundFlight = flightDetails;
                document.getElementById('step-2').style.display = 'none';
                document.getElementById('step-3').style.display = 'block';
                loadReturnFlights();
            } else {
                selectedReturnFlight = flightDetails;
                showItinerarySummary();
            }
        }
    }

    function showItinerarySummary() {
        var itinerarySummaryContainer = document.getElementById('itinerary-summary');
        itinerarySummaryContainer.innerHTML = '';

        if (selectedOutboundFlight) {
            itinerarySummaryContainer.innerHTML += `
                <div class="itinerary-outbound">
                    <h3>Vuelo de Ida</h3>
                    <p>${selectedOutboundFlight.description}</p>
                    <p>Precio: €${selectedOutboundFlight.price}</p>
                </div>
            `;
        }

        if (selectedReturnFlight) {
            itinerarySummaryContainer.innerHTML += `
                <div class="itinerary-return">
                    <h3>Vuelo de Vuelta</h3>
                    <p>${selectedReturnFlight.description}</p>
                    <p>Precio: €${selectedReturnFlight.price}</p>
                </div>
            `;
        }

        var totalAmount = parseFloat(selectedOutboundFlight.price) + (selectedReturnFlight ? parseFloat(selectedReturnFlight.price) : 0);
        itinerarySummaryContainer.innerHTML += `
            <div class="itinerary-total">
                <h3>Total</h3>
                <p>€${totalAmount.toFixed(2)}</p>
            </div>
        `;

        // Asegúrate de que el elemento exista antes de intentar establecer valores
        var offerIdElement = document.getElementById('selected-offer-id');
        if (!offerIdElement) {
            console.error("Elemento con ID 'selected-offer-id' no encontrado. Creando ahora...");
            // Crear el elemento dinámicamente si no existe
            var hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.id = 'selected-offer-id';
            hiddenInput.value = selectedOutboundFlight.flight_number;
            document.getElementById('itinerary-summary-container').appendChild(hiddenInput);
        } else {
            offerIdElement.value = selectedOutboundFlight.flight_number;
        }

        var totalAmountElement = document.getElementById('total-amount');
        if (!totalAmountElement) {
            console.error("Elemento con ID 'total-amount' no encontrado. Creando ahora...");
            // Crear el elemento dinámicamente si no existe
            var totalAmountSpan = document.createElement('span');
            totalAmountSpan.id = 'total-amount';
            totalAmountSpan.innerText = `€${totalAmount.toFixed(2)}`;
            document.getElementById('itinerary-summary-container').appendChild(totalAmountSpan);
        } else {
            totalAmountElement.innerText = `€${totalAmount.toFixed(2)}`;
        }

        document.getElementById('step-2').style.display = 'none';
        document.getElementById('step-3').style.display = 'none';
        document.getElementById('step-4').style.display = 'block';
    }

    document.getElementById('go-to-checkout').addEventListener('click', function() {
        console.log('Botón de checkout clicado'); // Depuración

        var offerIdElement = document.getElementById('selected-offer-id');
        if (offerIdElement) {
            var offerId = offerIdElement.value;
        } else {
            console.error("Elemento con ID 'selected-offer-id' no encontrado.");
            return; // Salir de la función si el elemento no está disponible
        }

        var totalAmountElement = document.getElementById('total-amount');
        if (totalAmountElement) {
            var totalAmount = parseFloat(totalAmountElement.innerText.replace('€', ''));
        } else {
            console.error("Elemento con ID 'total-amount' no encontrado.");
            return; // Salir de la función si el elemento no está disponible
        }

        var currency = 'EUR'; // Define la moneda según tus necesidades

        console.log('Datos de la oferta:', offerId, totalAmount, currency); // Depuración

        // Mostrar la sección de checkout
        document.getElementById('itinerary-summary-container').style.display = 'none';
        document.getElementById('checkout-section').style.display = 'block';
    });

    document.getElementById('pay-button').addEventListener('click', function() {
        var offerId = document.getElementById('selected-offer-id').value;
        var totalAmount = parseFloat(document.getElementById('total-amount').innerText.replace('€', ''));
        var currency = 'EUR';
        var passengerDetails = {
            email: document.getElementById('passenger-email').value,
            phone: document.getElementById('passenger-phone').value,
            given_name: document.getElementById('passenger-given-name').value,
            family_name: document.getElementById('passenger-family-name').value,
            gender: document.getElementById('passenger-gender').value,
            date_of_birth: document.getElementById('passenger-dob').value
        };

        if (!passengerDetails.email || !passengerDetails.phone || !passengerDetails.given_name || !passengerDetails.family_name || !passengerDetails.gender || !passengerDetails.date_of_birth) {
            alert('Por favor, complete todos los datos del pasajero.');
            return;
        }

        // Aquí se haría la solicitud de pago a la API de Duffel
        alert('Pago procesado con éxito para la oferta: ' + offerId);
        document.getElementById('payment-confirmation').innerHTML = `<p>Pago completado con éxito. ¡Gracias por su compra!</p>`;
    });

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

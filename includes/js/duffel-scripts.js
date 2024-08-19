document.addEventListener('DOMContentLoaded', function() {
    var selectedOutboundFlight = null;
    var selectedReturnFlight = null;

    function toggleReturnDateField() {
        var tripType = document.getElementById('trip_type').value;
        var returnDateGroup = document.getElementById('return-date-group');
        returnDateGroup.style.display = tripType === 'return' ? 'block' : 'none';
    }

    document.getElementById('trip_type').addEventListener('change', toggleReturnDateField);
    toggleReturnDateField();

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

        var offerIdElement = document.getElementById('selected-offer-id');
        if (!offerIdElement) {
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
        var offerIdElement = document.getElementById('selected-offer-id');
        if (!offerIdElement) return;

        var totalAmountElement = document.getElementById('total-amount');
        if (!totalAmountElement) return;

        document.getElementById('itinerary-summary-container').style.display = 'none';
        document.getElementById('checkout-section').style.display = 'block';
    });

    document.getElementById('pay-button').addEventListener('click', function() {
        var offerId = document.getElementById('selected-offer-id').value;
        var totalAmount = parseFloat(document.getElementById('total-amount').innerText.replace('€', ''));
        var currency = 'EUR';
        
        console.log({
            amount: totalAmount,
            currency: currency,
            offer_id: offerId
        });
        
        fetch(`${ajaxurl}?action=duffel_create_payment_intent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: totalAmount,
                currency: currency,
                offer_id: offerId
            })
        })
        
        
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                alert('Error creando Payment Intent: ' + data.error);
                return;
            }
    
            var clientSecret = data.client_secret;
    
            // Inicializa Stripe con tu clave pública
            var stripe = Stripe('pk_test_TVkFRF6cn7YeFfMCVm5u3wE7'); // Reemplaza con tu clave pública de Stripe
    
            // Usa Stripe para confirmar el pago
            stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement('card'),
                    billing_details: {
                        name: document.getElementById('passenger-given-name').value + ' ' + document.getElementById('passenger-family-name').value,
                        email: document.getElementById('passenger-email').value
                    }
                }
            }).then(function(result) {
                if (result.error) {
                    alert(result.error.message);
                } else {
                    if (result.paymentIntent.status === 'succeeded') {
                        alert('Pago completado con éxito');
                        document.getElementById('payment-confirmation').innerHTML = `<p>Pago completado con éxito. ¡Gracias por su compra!</p>`;
                    }
                }
            });
        })
        .catch(error => {
            alert('Error en el proceso de pago. Por favor, inténtelo de nuevo.');
            console.error('Error:', error);
        });
    });

    function loadOutboundFlights() {
        var origin = document.getElementById('origin').value;
        var destination = document.getElementById('destination').value;
        var departureDate = document.getElementById('departure_date').value;

        fetch(`${ajaxurl}?action=duffel_search_flights&origin=${origin}&destination=${destination}&departure_date=${departureDate}`)
            .then(response => response.json())
            .then(data => {
                var outboundFlightsContainer = document.getElementById('outbound-flights');
                outboundFlightsContainer.innerHTML = '';

                if (data.error) {
                    outboundFlightsContainer.innerHTML = `<p>Error loading outbound flights. ${data.error}</p>`;
                    return;
                }

                if (data.length > 0) {
                    data.forEach(flight => {
                        var slice = flight.slices && flight.slices[0];
                        if (!slice || !slice.segments || slice.segments.length === 0) return;

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
                var returnFlightsContainer = document.getElementById('return-flights');
                returnFlightsContainer.innerHTML = '';

                if (data.error) {
                    returnFlightsContainer.innerHTML = `<p>Error loading return flights. ${data.error}</p>`;
                    return;
                }

                if (data.length > 0) {
                    data.forEach(flight => {
                        var slice = flight.slices && flight.slices[0];
                        if (!slice || !slice.segments || slice.segments.length === 0) return;

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
                            handleFlightSelection(flightDetails);
                        });
                        returnFlightsContainer.appendChild(flightDiv);
                    });
                } else {
                    returnFlightsContainer.innerHTML = '<p>No return flights found.</p>';
                }
            })
            .catch(error => {
                document.getElementById('return-flights').innerHTML = '<p>Error loading return flights. Please try again.</p>';
            });
    }

    // Inicializa Stripe al cargar la página
    var stripe = Stripe('pk_test_TVkFRF6cn7YeFfMCVm5u3wE7'); // Reemplaza con tu clave pública de Stripe
    var elements = stripe.elements();
    var card = elements.create('card');
    card.mount('#card-element');
});

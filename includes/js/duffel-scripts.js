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

    function loadOutboundFlights() {
        var origin = document.getElementById('origin').value;
        var destination = document.getElementById('destination').value;
        var departureDate = document.getElementById('departure_date').value;

        fetch(`${ajaxurl}?action=duffel_search_flights&origin=${origin}&destination=${destination}&departure_date=${departureDate}`)
            .then(response => response.text())
            .then(text => {
                try {
                    var data = JSON.parse(text);
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
                            var flightDiv = document.createElement('div');
                            flightDiv.classList.add('flight');
                            flightDiv.innerHTML = `
                                <div class="flight-details">
                                    <p>${flight.departure} - ${flight.arrival}</p>
                                    <p>${flight.duration}</p>
                                    <p>${flight.stops} stop(s)</p>
                                    <p>${flight.airline}</p>
                                </div>
                                <div class="flight-price">
                                    <p>${flight.price}</p>
                                </div>
                            `;
                            outboundFlightsContainer.appendChild(flightDiv);
                        });

                        document.getElementById('next-to-step-3').style.display = 'block';
                    } else {
                        outboundFlightsContainer.innerHTML = '<p>No outbound flights found.</p>';
                    }
                } catch (error) {
                    console.error('Error parsing outbound flights response:', error);
                    console.error('Raw response:', text);
                    document.getElementById('outbound-flights').innerHTML = `<p>Error loading outbound flights. Please try again.</p><pre>${text}</pre>`;
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
            .then(response => response.text())
            .then(text => {
                try {
                    var data = JSON.parse(text);
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
                            var flightDiv = document.createElement('div');
                            flightDiv.classList.add('flight');
                            flightDiv.innerHTML = `
                                <div class="flight-details">
                                    <p>${flight.departure} - ${flight.arrival}</p>
                                    <p>${flight.duration}</p>
                                    <p>${flight.stops} stop(s)</p>
                                    <p>${flight.airline}</p>
                                </div>
                                <div class="flight-price">
                                    <p>${flight.price}</p>
                                </div>
                            `;
                            returnFlightsContainer.appendChild(flightDiv);
                        });
                    } else {
                        returnFlightsContainer.innerHTML = '<p>No return flights found.</p>';
                    }
                } catch (error) {
                    console.error('Error parsing return flights response:', error);
                    console.error('Raw response:', text);
                    document.getElementById('return-flights').innerHTML = `<p>Error loading return flights. Please try again.</p><pre>${text}</pre>`;
                }
            })
            .catch(error => {
                console.error('Error fetching return flights:', error);
                document.getElementById('return-flights').innerHTML = '<p>Error loading return flights. Please try again.</p>';
            });
    }
});

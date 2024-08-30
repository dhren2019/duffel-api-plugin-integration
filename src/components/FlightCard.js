// FlightCard.js
import React from 'react';

const FlightCard = ({ offer, index, selectedClass, passengers }) => {
    return (
        <div className="flight-card">
            <div className="flight-details">
                <h4>Oferta {index + 1}</h4>
                <p>Aerolínea: {offer.owner.name}</p>
                <p>Vuelo: {offer.slices[0].segments[0].operating_carrier_flight_number}</p>
                <p>Salida: {offer.slices[0].segments[0].departing_at}</p>
                <p>Llegada: {offer.slices[0].segments[0].arriving_at}</p>
                <p>Duración: {offer.slices[0].duration}</p>
                <p>Precio: {offer.total_amount} {offer.total_currency}</p>
                <p>Clase: {selectedClass}</p>
                <p>Pasajeros: {passengers.length}</p>
            </div>
            <button className="select-button">Seleccionar</button>
        </div>
    );
};

export default FlightCard;

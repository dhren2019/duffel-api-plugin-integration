// FlightResults.js
import React from 'react';
import { OfferCard } from '@duffel/components';

function FlightResults({ offers = [], filters, handleFilterChange }) {
    // Ensure offers is defined and is an array
    if (!Array.isArray(offers)) {
        return <p>No offers available</p>;
    }

    return (
        <div className="results-container">
            <aside className="filters-sidebar">
                <h3>Filters</h3>
                {/* Filter components */}
            </aside>
            <main className="offers-container">
                {offers.map((offer) => (
                    <OfferCard key={offer.id} offer={offer} />
                ))}
            </main>
        </div>
    );
}

export default FlightResults;

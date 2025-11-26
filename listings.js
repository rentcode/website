document.addEventListener('DOMContentLoaded', () => {
    const listingsGrid = document.getElementById('listings-grid');
    const bedroomsFilter = document.getElementById('bedrooms-filter');
    const maxPriceFilter = document.getElementById('max-price-filter');

    let allListings = [];

    // Fetch listings from the JSON file
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Filter for Ontario listings only
            allListings = data.filter(listing => listing.province === 'Ontario');
            displayListings(allListings);
        })
        .catch(error => {
            console.error('Error fetching listings:', error);
            listingsGrid.innerHTML = '<p>Could not load listings. Please try again later.</p>';
        });

    // Function to display listings
    function displayListings(listings) {
        listingsGrid.innerHTML = '';
        if (listings.length === 0) {
            listingsGrid.innerHTML = `
                <div class="no-results">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                    <h3>No Listings Found</h3>
                    <p>Try adjusting your filters to find your perfect home.</p>
                </div>
            `;
            return;
        }

        listings.forEach(listing => {
            const listingCard = `
                <div class="listing-card" data-aos="fade-up">
                    <div class="listing-image" style="background-image: url('${listing.image}')"><h3>${listing.title}</h3></div>
                    <div class="listing-info">
                        <p class="location"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${listing.city}, ${listing.province}</p>
                        <div class="listing-details">
                            <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"></path><path d="M2 10.6V7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v3.6"></path><path d="M12 4v17"></path></svg> ${listing.bedrooms} Bed</span>
                            <span><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-4 4v10h18V10l-4-4"></path><path d="M12 15v7"></path><path d="M9 22v-5"></path><path d="M15 22v-5"></path><path d="M5 6V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v1"></path></svg> ${listing.bathrooms} Bath</span>
                        </div>
                        <div class="listing-footer">
                            <p class="price">$${listing.price.toLocaleString()}/month</p>
                            <a href="#" class="details-button">View Details</a>
                        </div>
                    </div>
                </div>
            `;
            listingsGrid.innerHTML += listingCard;
        });
    }

    // Function to apply all filters
    function applyFilters() {
        let filteredListings = [...allListings];

        // Bedrooms filter
        if (bedroomsFilter.value !== 'all') {
            filteredListings = filteredListings.filter(l => l.bedrooms >= parseInt(bedroomsFilter.value));
        }

        // Max price filter
        if (maxPriceFilter.value) {
            filteredListings = filteredListings.filter(l => l.price <= parseInt(maxPriceFilter.value));
        }

        displayListings(filteredListings);
    }

    // Event listeners for filters
    bedroomsFilter.addEventListener('change', applyFilters);
    maxPriceFilter.addEventListener('input', applyFilters);
});
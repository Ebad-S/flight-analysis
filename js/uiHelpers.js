export function populateSelectOptions(data, selectElementId, key, displayFormatter = null) {
    // Get the select element by its ID
    const selectElement = document.getElementById(selectElementId);
    if (!selectElement) {
        console.error(`Select element with id ${selectElementId} not found`);
        return;
    }
    selectElement.innerHTML = ''; // Clear the dropdown first

    // Add the 'Any' option as the default
    const anyOption = document.createElement('option');
    anyOption.value = 'any';
    anyOption.textContent = 'Any';
    selectElement.appendChild(anyOption);

    // Populate the select element with options from the data
    data.forEach(item => {
        const optionValue = key ? item[key] : item;
        const formattedOption = displayFormatter ? displayFormatter(optionValue) : optionValue;
        const optElement = document.createElement('option');
        optElement.value = optionValue;
        optElement.textContent = formattedOption;
        selectElement.appendChild(optElement);
    });
}

export function displayFilteredFlights({ flights, initialLoad, currentlyDisplayed = 0 }) {
    const flightFilterDisplayDiv = document.getElementById('flightFilterDisplayDiv');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    let table;
    if (currentlyDisplayed === 0) {
        flightFilterDisplayDiv.innerHTML = ''; // Clear previous results only on initial load
        table = document.createElement('table');
        table.className = 'flight-table';
        
        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>#</th>
                <th>Airline</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Aircraft</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        
        flightFilterDisplayDiv.appendChild(table);
    } else {
        // If not initial load, get the existing table
        table = flightFilterDisplayDiv.querySelector('.flight-table');
    }

    // Get table body
    const tbody = table.querySelector('tbody');

    // Add new rows to the table
    const endIndex = Math.min(currentlyDisplayed + initialLoad, flights.length);
    for (let i = currentlyDisplayed; i < endIndex; i++) {
        const flight = flights[i];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${flight.airline_name_code}</td>
            <td>${flight.source_airport.airport_name_code}</td>
            <td>${flight.destination_airport.airport_name_code}</td>
            <td>${Array.isArray(flight.aircraft) ? flight.aircraft.join(', ') : flight.aircraft}</td>
        `;
        tbody.appendChild(row);
    }

    // Update the flight count display
    let totalFlights = flightFilterDisplayDiv.querySelector('.flight-count');
    if (!totalFlights) {
        totalFlights = document.createElement('p');
        totalFlights.className = 'flight-count';
        flightFilterDisplayDiv.appendChild(totalFlights);
    }
    totalFlights.innerHTML = `Displaying <strong>${endIndex}</strong> of <strong>${flights.length}</strong> flights`;

    // Show or hide 'Load more' button based on remaining flights
    if (endIndex < flights.length) {
        loadMoreBtn.classList.add('visible');
        loadMoreBtn.onclick = () => {
            displayFilteredFlights({ flights, initialLoad, currentlyDisplayed: endIndex });
            displayStatistics(flights);  // Add this line
        };
    } else {
        loadMoreBtn.classList.remove('visible');
    }

    // Update statistics on initial load
    if (currentlyDisplayed === 0) {
        displayStatistics(flights);
    }
}

export function displayAirports(airportsToDisplay) {
    const airportDisplayDiv = document.getElementById('airportDisplayDiv');
    airportDisplayDiv.innerHTML = ''; // Clear previous results

    const table = document.createElement('table');
    table.className = 'airport-table';

    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Name</th>
            <th>City</th>
            <th>Country</th>
            <th>IATA</th>
        </tr>
    `;
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    airportsToDisplay.forEach(airport => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${airport.name}</td>
            <td>${airport.city}</td>
            <td>${airport.country}</td>
            <td>${airport.iata}</td>
        `;
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    airportDisplayDiv.appendChild(table);

    // Display the total number of airports
    const totalAirports = document.createElement('p');
    totalAirports.textContent = `Total airports: ${airportsToDisplay.length}`;
    airportDisplayDiv.appendChild(totalAirports);
}

export function setupBackToTopButton() {
    const backToTopBtn = document.getElementById('backToTopBtn');

    // Show or hide the 'Back to Top' button based on scroll position
    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });

    // Scroll to the top of the page when the button is clicked
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

import { calculateDistance } from './dataAnalysis.js';

export function displayStatistics(flights) {
    const statisticsDisplayDiv = document.getElementById('statisticsDisplayDiv');
    
    // Calculate basic statistics
    const totalFlights = flights.length;
    const uniqueAirlines = new Set(flights.map(f => f.airline_name_code)).size;
    const uniqueSourceAirports = new Set(flights.map(f => f.source_airport.airport_name_code)).size;
    const uniqueDestinationAirports = new Set(flights.map(f => f.destination_airport.airport_name_code)).size;
    const uniqueAircraftTypes = new Set(flights.flatMap(f => Array.isArray(f.aircraft) ? f.aircraft : [f.aircraft])).size;

    // Calculate route statistics
    let totalDistance = 0;
    let totalTimezoneChange = 0;
    let routeCount = 0;

    const routeMap = new Map();
    flights.forEach(flight => {
        const routeKey = `${flight.source_airport.airport_name_code} to ${flight.destination_airport.airport_name_code}`;
        if (!routeMap.has(routeKey)) {
            routeMap.set(routeKey, true);
            routeCount++;

            // Calculate distance and timezone change for the route
            const distance = calculateDistance(
                flight.source_airport.latitude, flight.source_airport.longitude,
                flight.destination_airport.latitude, flight.destination_airport.longitude
            );
            totalDistance += distance;

            const timezoneChange = Math.abs(flight.destination_airport.timezone - flight.source_airport.timezone);
            totalTimezoneChange += timezoneChange;
        }
    });

    const averageDistance = totalDistance / routeCount;
    const averageTimezoneChange = totalTimezoneChange / routeCount;

    // Create HTML content for statistics
    const statisticsHTML = `
        <h3>Statistics for this filter</h3>
        <ul class="statistics-list">
            <li><span class="stat-label">Total Flights:</span> <span class="stat-value">${totalFlights}</span></li>
            <li><span class="stat-label">Number of Airlines:</span> <span class="stat-value">${uniqueAirlines}</span></li>
            <li><span class="stat-label">Number of Source Airports:</span> <span class="stat-value">${uniqueSourceAirports}</span></li>
            <li><span class="stat-label">Number of Destination Airports:</span> <span class="stat-value">${uniqueDestinationAirports}</span></li>
            <li><span class="stat-label">Number of Aircraft Types:</span> <span class="stat-value">${uniqueAircraftTypes}</span></li>
            <li><span class="stat-label">Number of Unique Routes:</span> <span class="stat-value">${routeCount}</span></li>
            <li><span class="stat-label">Average Route Distance:</span> <span class="stat-value">${averageDistance.toFixed(2)} km</span></li>
            <li><span class="stat-label">Average Timezone Change:</span> <span class="stat-value">${averageTimezoneChange.toFixed(2)} hours</span></li>
        </ul>
    `;

    // Update the statistics div with the new content
    statisticsDisplayDiv.innerHTML = statisticsHTML;
}

export function setupAirportFilters(airports) {
    const citySelect = document.getElementById('filterCitySelect');
    const cityMap = new Map();

    // Map airports to their respective cities
    airports.forEach(airport => {
        if (airport.city) {
            if (!cityMap.has(airport.city)) {
                cityMap.set(airport.city, []);
            }
            cityMap.get(airport.city).push(airport.airport_name_code);
        }
    });

    const sortedCities = Array.from(cityMap.keys()).sort();

    citySelect.innerHTML = '<option value="any">Any</option>'; // Reset the select
    
    // Populate the city select element with options
    sortedCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = `${city} (${cityMap.get(city).length} airport${cityMap.get(city).length > 1 ? 's' : ''})`;
        citySelect.appendChild(option);
    });
}

export function filterAirports(airports, city, searchTerm) {
    // Filter airports based on city and search term
    return airports.filter(airport => {
        const cityMatch = city === 'any' || airport.city === city;
        const searchMatch = !searchTerm || 
                            airport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            airport.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            airport.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            airport.iata.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (airport.airport_name_code && airport.airport_name_code.toLowerCase().includes(searchTerm.toLowerCase()));
        return cityMatch && searchMatch;
    });
}

export function displayFilteredAirports(airports, start = 0, limit = 10) {
    const airportFilterDisplayDiv = document.getElementById('airportFilterDisplayDiv');
    const loadMoreAirportsBtn = document.getElementById('loadMoreAirportsBtn');
    
    // Clear previous results only if it's the initial display
    if (start === 0) {
        airportFilterDisplayDiv.innerHTML = '';
    }

    // Display a message if no airports match the criteria
    if (airports.length === 0) {
        airportFilterDisplayDiv.innerHTML = '<p>No airports found matching your criteria.</p>';
        loadMoreAirportsBtn.style.display = 'none';
        return;
    }

    // Determine which subset of airports to display
    const end = Math.min(start + limit, airports.length);
    const airportsToDisplay = airports.slice(start, end);

    // Create or get the table element
    let table = airportFilterDisplayDiv.querySelector('.airport-table');
    if (!table) {
        table = document.createElement('table');
        table.className = 'airport-table';
        
        // Add table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>City</th>
                <th>Country</th>
                <th>IATA</th>
                <th>Airport Code</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Create table body
        const tbody = document.createElement('tbody');
        table.appendChild(tbody);
        
        airportFilterDisplayDiv.appendChild(table);
    }

    // Get table body
    const tbody = table.querySelector('tbody');

    // Add rows for each airport
    airportsToDisplay.forEach((airport, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${start + index + 1}</td>
            <td>${sanitizeHTML(airport.name)}</td>
            <td>${sanitizeHTML(airport.city)}</td>
            <td>${sanitizeHTML(airport.country)}</td>
            <td>${sanitizeHTML(airport.iata)}</td>
            <td>${sanitizeHTML(airport.airport_name_code)}</td>
        `;
        tbody.appendChild(row);
    });

    // Update or create the airport count display
    let airportCount = airportFilterDisplayDiv.querySelector('.airport-count');
    if (!airportCount) {
        airportCount = document.createElement('p');
        airportCount.className = 'airport-count';
        airportFilterDisplayDiv.appendChild(airportCount);
    }
    airportCount.textContent = `Displaying ${end} of ${airports.length} airports`;

    // Show or hide the 'Load More' button based on remaining airports
    if (end < airports.length) {
        loadMoreAirportsBtn.style.display = 'block';
        loadMoreAirportsBtn.onclick = () => displayFilteredAirports(airports, end, limit);
    } else {
        loadMoreAirportsBtn.style.display = 'none';
    }
}

// Function to sanitize HTML to prevent XSS attacks
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Function to create a button element
function createButton(id, text) {
    const button = document.createElement('button');
    button.id = id;
    button.className = 'btn';
    button.textContent = text;
    return button;
}

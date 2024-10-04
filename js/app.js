import { loadMainDataset } from './dataLoader.js';
import { getUniqueAirports, getUniqueAirlines, getUniqueAircraftNames, filterFlights } from './dataAnalysis.js';
import { populateSelectOptions, displayFilteredFlights, displayAirports, setupBackToTopButton, displayStatistics } from './uiHelpers.js';
import { setupAirportFilters, filterAirports, displayFilteredAirports } from './uiHelpers.js';

// Function to sanitize user input to prevent XSS attacks
function sanitizeInput(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Event listener for when the DOM content is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Loading the main dataset
        const mainDataset = await loadMainDataset();
        console.log('Loaded mainDataset:', mainDataset);
        
        // Setup UI elements and event listeners
        setupUIElements(mainDataset);
        setupEventListeners(mainDataset);
        setupBackToTopButton();

    } catch (error) {
        // Handle errors during data loading
        console.error('Error loading data:', error);
        alert('An error occurred while loading the data. Please try refreshing the page.');
    }
});

// Function to setup UI elements with data from the main dataset
function setupUIElements(mainDataset) {
    // Get unique values for dropdowns
    const uniqueAirports = getUniqueAirports(mainDataset);
    const uniqueAirlines = getUniqueAirlines(mainDataset);
    const aircrafts = getUniqueAircraftNames(mainDataset);

    // Populate dropdown options
    populateSelectOptions(uniqueAirports, 'filterSourceAirportSelect', 'airport_name_code');
    populateSelectOptions(uniqueAirports, 'filterDestinationAirportSelect', 'airport_name_code');
    populateSelectOptions(uniqueAirlines, 'filterAirlineSelect', null, (airline) => airline);
    populateSelectOptions(aircrafts.sortedAircrafts, 'filterAircraftSelect', null, (aircraft) => aircraft);

    // Display initial set of flights
    displayFilteredFlights({ flights: mainDataset, initialLoad: 20 });
}

// Function to setup event listeners for user interactions
function setupEventListeners(mainDataset) {
    const filterFlightsBtn = document.getElementById('filterFlightsBtn');

    // Event listener for filtering flights
    filterFlightsBtn.addEventListener('click', () => {
        const source = sanitizeInput(document.getElementById('filterSourceAirportSelect').value);
        const destination = sanitizeInput(document.getElementById('filterDestinationAirportSelect').value);
        const airline = sanitizeInput(document.getElementById('filterAirlineSelect').value);
        const aircraft = sanitizeInput(document.getElementById('filterAircraftSelect').value);

        // Filter and display flights based on user input
        const filteredFlights = filterFlights(mainDataset, source, destination, airline, aircraft);
        displayFilteredFlights({ flights: filteredFlights, initialLoad: 20 });
        displayStatistics(filteredFlights);
    });

    const filterAirportsBtn = document.getElementById('filterAirportsBtn');
    const filterCitySelect = document.getElementById('filterCitySelect');
    const filterSearchTermInput = document.getElementById('filterSearchTermInput');

    const uniqueAirports = getUniqueAirports(mainDataset);
    setupAirportFilters(uniqueAirports);

    // Display initial set of airports
    displayFilteredAirports(uniqueAirports);

    // Event listener for filtering airports
    filterAirportsBtn.addEventListener('click', () => {
        const city = sanitizeInput(filterCitySelect.value);
        const searchTerm = sanitizeInput(filterSearchTermInput.value.trim());
        const filteredAirports = filterAirports(uniqueAirports, city, searchTerm);
        displayFilteredAirports(filteredAirports);
    });

    // Prevent default behavior on mouseover and mouseout events for the filter flights button
    document.getElementById('filterFlightsBtn').addEventListener('mouseover', function(e) {
        e.preventDefault();
    });

    document.getElementById('filterFlightsBtn').addEventListener('mouseout', function(e) {
        e.preventDefault();
    });
}

// Function to filter and display airports based on user input
function filterAndDisplayAirports(mainDataset) {
    const selectedCity = sanitizeInput(document.getElementById('filterCitySelect').value);
    const searchTerm = sanitizeInput(document.getElementById('filterSearchTermInput').value.toLowerCase());

    // Filter airports based on selected city and search term
    const filteredAirports = getUniqueAirports(mainDataset).filter(airport => 
        (selectedCity === 'any' || airport.city === selectedCity) &&
        airport.name.toLowerCase().includes(searchTerm)
    );

    // Display filtered airports
    displayAirports(filteredAirports);
}


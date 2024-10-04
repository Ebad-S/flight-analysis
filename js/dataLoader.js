import { mapDataset } from './dataMapping.js';

// Function to load flight data from a JSON file
async function loadFlights() {
    const flightsResponse = await fetch('dataSource/A2_Flights.json');
    if (!flightsResponse.ok) {
        throw new Error(`HTTP error! Status: ${flightsResponse.status}`);
    }
    const flights = await flightsResponse.json();
   
    // Add 'airline_name_code' to each flight
    const updatedFlights = flights.map(flight => {
        return {
            ...flight,
            airline_name_code: `${flight.airline_name}(${flight.airline})`
        };
    });

    // Return the updated flights data
    return updatedFlights;
}

// Function to load airport data from a JSON file
async function loadAirports() {
    const airportsResponse = await fetch('dataSource/A2_Airports.json');
    if (!airportsResponse.ok) {
        throw new Error(`HTTP error! Status: ${airportsResponse.status}`);
    }
    const airports = await airportsResponse.json();
    
    // Add 'airport_name_code' to each airport
    const updatedAirports = airports.map(airport => ({
        ...airport,
        airport_name_code: `${airport.name}(${airport.iata})`
    }));
    
    // Return the updated airports data
    return updatedAirports;
}

// Function to create the main dataset by combining updated flights and updated airports
function createMainDataset(updatedFlights, updatedAirports) {
    const mainDataset = updatedFlights.map(flight => {
        // Find the source and destination airports for each flight
        const sourceAirport = updatedAirports.find(airport => airport.id === flight.source_airport_id);
        const destinationAirport = updatedAirports.find(airport => airport.id === flight.destination_airport_id);

        // Create a new object for each flight with additional information
        const result = {
            codeshare: flight.codeshare,
            aircraft: Array.isArray(flight.aircraft) ? flight.aircraft : [flight.aircraft],
            source_airport: sourceAirport,
            destination_airport: destinationAirport,
            airline: flight.airline,
            airline_name_code: flight.airline_name_code,
            timestamp: new Date().toISOString()
        };
        // console.log('Sample mainDataset item:', result); // Debug log
        return result;
    });

    // Return the main dataset
    return mainDataset;
}

// Function to load the main dataset with mapping
async function loadMainDataset() {
    try {
        // Load flights and airports data
        const flightsData = await loadFlights();
        const airportsData = await loadAirports();
        let mainDataset = createMainDataset(flightsData, airportsData);

        // Map the dataset if necessary
        mainDataset = mapDataset(mainDataset, (flight) => ({
            // update the timestamp to the current time
        }));

        // Return the main dataset
        return mainDataset;
    } catch (error) {
        // Handle errors during data loading
        console.error('Error loading mainDataset:', error);
        throw error;
    }
}

// Function to create and return an array of unique aircraft names from flight data
function getUniqueAircraftNames(flights) {
    const uniqueAircrafts = new Set();
    flights.forEach(flight => {
        if (flight.aircraft && Array.isArray(flight.aircraft)) {
            flight.aircraft.forEach(aircraft => {
                uniqueAircrafts.add(aircraft);
            });
        }
    });
    // Convert the set to a sorted array
    const sortedAircrafts = Array.from(uniqueAircrafts).sort();
    return {
        sortedAircrafts
    };
}

// Export the functions for use in other modules
export { loadMainDataset, getUniqueAircraftNames };
















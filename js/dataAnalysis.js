// Function to get unique airports from the flights data
export function getUniqueAirports(flights) {
    const airportMap = new Map();
    flights.forEach(flight => {
        // Add source airport to the map if it exists
        if (flight.source_airport) {
            airportMap.set(flight.source_airport.airport_name_code, flight.source_airport);
        }
        // Add destination airport to the map if it exists
        if (flight.destination_airport) {
            airportMap.set(flight.destination_airport.airport_name_code, flight.destination_airport);
        }
    });
    // Convert the map values to an array and return
    return Array.from(airportMap.values());
}

// Function to get unique airlines from the flights data
export function getUniqueAirlines(flights) {
    const uniqueAirlines = new Set();
    flights.forEach(flight => {
        // Add airline name code to the set if it exists
        if (flight.airline_name_code) {
            uniqueAirlines.add(flight.airline_name_code);
        }
    });
    // Convert the set to a sorted array and return
    const airlines = Array.from(uniqueAirlines).sort();
    // console.log('Unique airlines:', airlines);
    return airlines;
}

// Function to get unique aircraft names from the flights data
export function getUniqueAircraftNames(flights) {
    const uniqueAircrafts = new Set();
    flights.forEach(flight => {
        // Add each aircraft to the set if it exists and is an array
        if (flight.aircraft && Array.isArray(flight.aircraft)) {
            flight.aircraft.forEach(aircraft => {
                uniqueAircrafts.add(aircraft);
            });
        }
    });
    // Convert the set to a sorted array and return as an object
    const sortedAircrafts = Array.from(uniqueAircrafts).sort();
    return { sortedAircrafts };
}

// Function to filter flights based on various criteria
export function filterFlights(dataset, source, destination, airline, aircraft) {
    return dataset.filter(flight => {
        // Check if the flight matches the source criteria
        const matchesSource = (source === 'any' || 
            flight.source_airport.airport_name_code === source || 
            flight.source_airport.id === source);
        
        // Check if the flight matches the destination criteria
        const matchesDestination = (destination === 'any' || 
            flight.destination_airport.airport_name_code === destination || 
            flight.destination_airport.id === destination);
        
        // Check if the flight matches the airline criteria
        const matchesAirline = (airline === 'any' || flight.airline.code === airline);
        
        // Check if the flight matches the aircraft criteria
        const matchesAircraft = (aircraft === 'any' || 
            (flight.aircraft && flight.aircraft.includes(aircraft)));

        // Return true if the flight matches all criteria
        return matchesSource && matchesDestination && matchesAirline && matchesAircraft;
    });
}

// Function to calculate the distance between two geographical points using the Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1); // Convert latitude difference to radians
    const dLon = deg2rad(lon2 - lon1); // Convert longitude difference to radians
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
}

// Helper function to convert degrees to radians
function deg2rad(deg) {
    return deg * (Math.PI/180);
}




// The following functions are simplified or copied versions of those that can be tested.
// Refer to README.md for more details on each function.

// Function to get unique airports from the flight data
// Takes an array of flight objects and returns an array of unique airport names
function getUniqueAirports(flights) {
    const airportSet = new Set();
    flights.forEach(flight => {
        airportSet.add(flight.source_airport.name);
    });
    return Array.from(airportSet);
}

// Function to get unique airlines from the flight data
// Takes an array of flight objects and returns a sorted array of unique airline codes
function getUniqueAirlines(flights) {
    const airlineSet = new Set();
    flights.forEach(flight => {
        airlineSet.add(flight.airline_name_code);
    });
    return Array.from(airlineSet).sort();
}

// Function to get unique aircraft names from the flight data
// Takes an array of flight objects and returns an object with a sorted array of unique aircraft names
function getUniqueAircraftNames(flights) {
    const aircraftSet = new Set();
    flights.forEach(flight => {
        flight.aircraft.forEach(aircraft => {
            aircraftSet.add(aircraft);
        });
    });
    return { sortedAircrafts: Array.from(aircraftSet).sort() };
}

// Function to filter flights based on source, destination, airline, and aircraft
// Takes a dataset of flights and filter criteria, returns an array of flights that match the criteria
function filterFlights(dataset, source, destination, airline, aircraft) {
    return dataset.filter(flight => 
        flight.source_airport.name === source &&
        flight.destination_airport.name === destination &&
        flight.airline_name_code === airline &&
        flight.aircraft.includes(aircraft)
    );
}

// Function to calculate the distance between two geographical points
// Takes the latitude and longitude of two points, returns the distance in kilometers
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat)/2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLon))/2;
    return R * 2 * Math.asin(Math.sqrt(a));
}

// Function to map over a dataset and apply a provided operation to each element
// Takes a dataset and a mapping function, returns a new dataset with the mapping function applied to each element
function mapDataset(dataset, mapFunction) {
    return dataset.map(item => {
        const updatedItem = mapFunction(item);
        return {
            ...item,
            ...updatedItem,
            timestamp: new Date().toISOString()
        };
    });
}

// Function to create the main dataset by combining updated flights and airports
// Takes arrays of updated flights and updated airports, returns the combined main dataset
function createMainDataset(updatedFlights, updatedAirports) {
    return updatedFlights.map(flight => {
        const sourceAirport = updatedAirports.find(airport => airport.id === flight.source_airport_id);
        const destinationAirport = updatedAirports.find(airport => airport.id === flight.destination_airport_id);
        return {
            ...flight,
            source_airport: sourceAirport,
            destination_airport: destinationAirport
        };
    });
}

// Simplified sanitization function for Node.js
function sanitizeInput(input) {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Function to handle the input (e.g., filtering airports)
function handleFilterSearchTermInput(input) {
    const sanitizedInput = sanitizeInput(input);
    // Simulate filtering logic (e.g., searching airport names)
    // For demonstration, we'll just return the sanitized input
    return sanitizedInput;
}

// Test functions
function testGetUniqueAirports() {
    console.log("Testing getUniqueAirports:");
    const flights = [
        { source_airport: { name: "A" } },
        { source_airport: { name: "B" } },
        { source_airport: { name: "A" } }
    ];
    const result = getUniqueAirports(flights);
    console.log("Standard input:", result.length === 2 ? "PASS" : "FAIL");
}

function testGetUniqueAirlines() {
    console.log("\nTesting getUniqueAirlines:");
    const flights = [
        { airline_name_code: "Airline1(A1)" },
        { airline_name_code: "Airline2(A2)" },
        { airline_name_code: "Airline1(A1)" }
    ];
    const result = getUniqueAirlines(flights);
    console.log("Unique airlines:", result.length === 2 ? "PASS" : "FAIL");
}

function testGetUniqueAircraftNames() {
    console.log("\nTesting getUniqueAircraftNames:");
    const flights = [
        { aircraft: ["Boeing 747", "Airbus A320"] },
        { aircraft: ["Airbus A320", "Boeing 737"] },
        { aircraft: ["Boeing 747"] }
    ];
    const result = getUniqueAircraftNames(flights);
    console.log("Unique aircraft:", result.sortedAircrafts.length === 3 ? "PASS" : "FAIL");
}

function testFilterFlights() {
    console.log("\nTesting filterFlights:");
    const dataset = [
        { source_airport: { name: "A" }, destination_airport: { name: "B" }, airline_name_code: "Airline1(A1)", aircraft: ["Boeing 747"] },
        { source_airport: { name: "B" }, destination_airport: { name: "C" }, airline_name_code: "Airline2(A2)", aircraft: ["Airbus A320"] }
    ];
    const result = filterFlights(dataset, "A", "B", "Airline1(A1)", "Boeing 747");
    console.log("Filtered flights:", result.length === 1 ? "PASS" : "FAIL");
}

function testCalculateDistance() {
    console.log("\nTesting calculateDistance:");
    const result = calculateDistance(0, 0, 0, 1);
    console.log("Known coordinates:", Math.abs(result - 111.19) < 0.01 ? "PASS" : "FAIL");
}

function testMapDataset() {
    console.log("\nTesting mapDataset:");
    const dataset = [{ id: 1, value: "test" }];
    const result = mapDataset(dataset, item => ({ ...item, newField: "added" }));
    console.log("Mapped dataset:", result[0].newField === "added" && result[0].timestamp ? "PASS" : "FAIL");
}

function testCreateMainDataset() {
    console.log("\nTesting createMainDataset:");
    const flights = [{ source_airport_id: 1, destination_airport_id: 2 }];
    const airports = [{ id: 1, name: "Airport1" }, { id: 2, name: "Airport2" }];
    const result = createMainDataset(flights, airports);
    console.log("Main dataset creation:", result[0].source_airport && result[0].destination_airport ? "PASS" : "FAIL");
}

// Test function for input sanitization
function testSanitizeInput() {
    console.log("\nTesting sanitizeInput:");

    // Test with potentially harmful input
    const harmfulInput = " <script>alert('XSS')</script> ";
    const sanitizedHarmfulInput = handleFilterSearchTermInput(harmfulInput);
    console.log("Harmful input:", sanitizedHarmfulInput === " &lt;script&gt;alert('XSS')&lt;/script&gt; " ? "PASS" : "FAIL");

    // Test with normal input
    const normalInput = "Normal input";
    const sanitizedNormalInput = handleFilterSearchTermInput(normalInput);
    console.log("Normal input:", sanitizedNormalInput === "Normal input" ? "PASS" : "FAIL");

    // Test with empty input
    const emptyInput = "";
    const sanitizedEmptyInput = handleFilterSearchTermInput(emptyInput);
    console.log("Empty input:", sanitizedEmptyInput === "" ? "PASS" : "FAIL");
}

// Run tests
testGetUniqueAirports();
testGetUniqueAirlines();
testGetUniqueAircraftNames();
testFilterFlights();
testCalculateDistance();
testMapDataset();
testCreateMainDataset();
testSanitizeInput();
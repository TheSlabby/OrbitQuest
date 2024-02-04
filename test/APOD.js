let imageURL, imageTitle, imageDescription
const fetch = require('node-fetch'); // Make sure to install 'node-fetch' using npm install node-fetch

function init {
        const response = await fetch('http://api.open-notify.org/iss-now.json');
        const data = await response.json(); // Extract JSON from the HTTP response
        let lat = data.iss_position.latitude;
        let lon = data.iss_position.longitude;
        console.log(lat);
        console.log(lon);
    
        let goal = new THREE.Vector3();
        const toRad = Math.PI / 180;
        const rho = 100;
        goal.x = rho * Math.sin(lat * toRad) * Math.cos(lon * toRad); 
        goal.z = rho * Math.sin(lat * toRad) * Math.sin(lon * toRad);
        goal.y = rho * Math.cos(lat * toRad);
    
        console.log(goal);
    
        addMarker(goal);
    
    
    
    
}
async function getApod(apiKey) {
    const baseUrl = "https://api.nasa.gov/planetary/apod";
    
    // If you have an API key, include it in the request
    const params = apiKey ? { api_key: apiKey } : {};
    
    const response = await fetch(`${baseUrl}?${new URLSearchParams(params)}`);
    
    if (response.ok) {
        const data = await response.json();
        return data;
    } else {
        console.error(`Error: ${response.status}`);
        return null;
    }
}

// Replace 'YOUR_API_KEY' with your actual NASA API key
const nasaApiKey = process.env.APOD_KEY;
getApod(nasaApiKey)
    .then(apodData => {
        if (apodData) {
            console.log("Title:", apodData.title);
            console.log("Date:", apodData.date);
            console.log("Explanation:", apodData.explanation);
            console.log("HD URL:", apodData.hdurl);
            console.log("URL:", apodData.url);
        } else {
            console.log("Failed to retrieve APOD data.");
        }
    })
    .catch(error => console.error("Error:", error));
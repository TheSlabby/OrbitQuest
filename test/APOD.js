const nasaApiKey = process.env.APOD_KEY;
let apodTitle, apodDate, apodExplanation, apodHdUrl, apodUrl;

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


getApod(nasaApiKey)
    .then(apodData => {
        if (apodData) {
            // Assign values to variables
            apodTitle = apodData.title;
            apodDate = apodData.date;
            apodExplanation = apodData.explanation;
            apodHdUrl = apodData.hdurl;
            apodUrl = apodData.url;

            // Manipulate the HTML DOM to display the values
            document.getElementById('title').innerText = `Title: ${apodTitle}`;
            document.getElementById('date').innerText = `Date: ${apodDate}`;
            document.getElementById('explanation').innerText = `Explanation: ${apodExplanation}`;
            document.getElementById('hdUrl').innerText = `HD URL: ${apodHdUrl}`;
            document.getElementById('url').innerText = `URL: ${apodUrl}`;
        } else {
            console.log("Failed to retrieve APOD data.");
        }
    })
    .catch(error => console.error("Error:", error));

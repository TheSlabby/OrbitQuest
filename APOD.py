import requests

def get_apod(api_key=None):
    base_url = "https://api.nasa.gov/planetary/apod"

    # If you have an API key, you can include it in the request
    if api_key:
        params = {'api_key': api_key}
    else:
        params = {}

    response = requests.get(base_url, params=params)

    if response.status_code == 200:
        data = response.json()
        return data
    else:
        print(f"Error: {response.status_code}")
        return None


# Replace 'YOUR_API_KEY' with your actual NASA API key
nasa_api_key = 'YOUR_API_Key'
apod_data = get_apod(api_key=nasa_api_key)

if apod_data:
    print("Title:", apod_data['title'])
    print("Date:", apod_data['date'])
    print("Explanation:", apod_data['explanation'])
    print("HD URL:", apod_data['hdurl'])
    print("URL:", apod_data['url'])
else:
    print("Failed to retrieve APOD data.")
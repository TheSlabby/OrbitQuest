from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt #TODO remove this
import utils, requests

def get_country(request):
    KEY = utils.getGeoKey()



    try:
        iss_response = requests.get('http://api.open-notify.org/iss-now.json')
        iss_data = iss_response.json()
        lat = iss_data['iss_position']['latitude']
        lon = iss_data['iss_position']['longitude']


        # Make the GET request to the API'
        api_url = f"https://geocode.maps.co/reverse?lat={lat}&lon={lon}&api_key=" + KEY
        print("API URL:", api_url)
        response = requests.get(api_url)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            # Return the JSON response from the API
            return JsonResponse(response.json(), safe=False)
        else:
            # Handle responses with error status codes
            return JsonResponse({'error': 'Failed to fetch data from the API'}, status=response.status_code)
    except Exception as e:
        print(str(e))
        # Handle any errors during the request
        return JsonResponse({'error': str(e)}, status=500)



# Your view function
def my_view(request):
    # Define context if you need to pass data to the template
    context = {'message': 'Hello, Django!'}
    
    # Render the template
    return render(request, 'tracker.html', context)

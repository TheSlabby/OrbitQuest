from django.shortcuts import render

# Your view function
def my_view(request):
    # Define context if you need to pass data to the template
    context = {'message': 'Hello, Django!'}
    
    # Render the template
    return render(request, 'tracker.html', context)

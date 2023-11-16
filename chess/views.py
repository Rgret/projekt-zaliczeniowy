from django.shortcuts import render

# Create your views here.
def index(request):
    return render(request, 'chess/index.html')

def game(request, id):
    return render(request, 'game/game.html')
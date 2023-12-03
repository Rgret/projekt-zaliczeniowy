from django.shortcuts import render
from .db_controller import *

# Create your views here.
def index(request):
    return render(request, 'chess/index.html')

def game(request, id):
    return render(request, 'game/game.html', {"game_id" : id})

def lobby(request):
    lobbies = get_lobbies_data()
    return render(request, 'lobby/lobby.html', {'lobbies': lobbies})
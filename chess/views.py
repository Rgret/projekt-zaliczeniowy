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


def login(request):
    if request.method == 'POST':
        # Tutaj umieść logikę autentykacji, sprawdzanie danych logowania itp.
        # Jeżeli autentykacja powiedzie się, możesz przekierować użytkownika gdzieś indziej.
        # W przeciwnym razie możesz zwrócić błąd lub informację o nieudanej próbie logowania.
        pass

    return render(request, 'login/login.html', {})

def register(request):
    if request.method == 'POST':
        # Tutaj umieść logikę autentykacji, sprawdzanie danych logowania itp.
        # Jeżeli autentykacja powiedzie się, możesz przekierować użytkownika gdzieś indziej.
        # W przeciwnym razie możesz zwrócić błąd lub informację o nieudanej próbie logowania.
        pass
    
    return render(request, 'register/register.html', {})
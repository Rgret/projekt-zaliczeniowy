from django.shortcuts import render
from .db_controller import *
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib.auth import logout  # do wylogowania
from django.shortcuts import redirect

# Create your views here.
def index(request):
    return render(request, 'chess/index.html')

def game(request, id):
    return render(request, 'game/game.html', {"game_id" : id})

def lobby(request):
    lobbies = get_lobbies_data()
    return render(request, 'lobby/lobby.html', {'lobbies': lobbies})

def home(request):
    return render(request, 'home/home.html')




def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')  # Przekierowanie do strony głównej
        else:
            return render(request, 'login/login.html', {'error': 'Nieprawidłowa nazwa użytkownika lub hasło'})

    return render(request, 'login/login.html')

def user_logout(request):
    logout(request)
    return redirect('home')



def register(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']

        # Tworzenie nowego użytkownika
        user = User.objects.create_user(username, email, password)
        user.save()

        # Opcjonalnie: automatyczne logowanie po rejestracji
        login(request, user)
        return redirect('home')  # Zakładając, że masz stronę główną o nazwie 'home'

    return render(request, 'register/register.html')


from django.shortcuts import render
from .db_controller import *
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.contrib.auth import logout  # do wylogowania
from django.shortcuts import redirect
from django.conf import settings
from django.db import models
import os

# Create your views here.
def index(request):
    return redirect('home')

def game(request, id):
    if not Games.objects.filter(id=id).exists(): return render(request, '404.html', {})
    images_folder = os.path.join(settings.BASE_DIR, 'chess', 'static', 'game', 'images')
    image_files = [f for f in os.listdir(images_folder) if os.path.isfile(os.path.join(images_folder, f))]
    image_list = []
    for image in image_files:
        image_list.append({'name': os.path.splitext(image)[0], 'url': "game/images/{0}".format(image)})
    return render(request, 'game/game.html', {"game_id" : id, 'image_list': image_list})

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


from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('game/<int:id>', views.game, name='game'),
    path('home', views.home, name='home'),
    path('lobby', views.lobby, name='lobby'),
    path('login', views.login, name='login'),
    path('register', views.register, name='register'),
]
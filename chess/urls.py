from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('game/<int:id>', views.game, name='game'),
    path('lobby', views.lobby, name='lobby'),
]
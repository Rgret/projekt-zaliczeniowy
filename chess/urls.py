from django.contrib import admin
from django.urls import path
from . import views
from .views import user_login
from .views import user_logout

urlpatterns = [
    path('', views.index, name='index'),
    path('game/<int:id>', views.game, name='game'),
    path('home', views.home, name='home'),
    path('lobby', views.lobby, name='lobby'),
    path('login/', user_login, name='user_login'),
    path('register', views.register, name='register'),
    path('logout/', user_logout, name='user_logout'),
    #path('login/', views.login_view, name='login'), # moze potrzebne
]
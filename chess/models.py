from django.db import models

# Create your models here.
class Games(models.Model):
    pass
#on_delete=models.SET_NULL,
#null=True
class Users(models.Model):
    username = models.CharField(max_length=16)
    login = models.CharField(max_length=16)
    password = models.CharField(max_length=16)
    email = models.CharField(max_length=32)                             
    id_games = models.ForeignKey(Games, on_delete=models.SET_NULL, null=True)

class Lobbies(models.Model):
    id_game = models.ForeignKey(Games, on_delete=models.SET_NULL, null=True)      
    id_host = models.ForeignKey(Users, on_delete=models.SET_NULL, null= True, related_name="host")
    id_player = models.ForeignKey(Users, on_delete=models.SET_NULL, null=True, related_name="player")

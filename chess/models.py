from django.db import models

# Create your models here.
class Games(models.Model):
    pass

class Users(models.Model):
    username = models.CharField(max_length=16)
    password = models.CharField(max_length=16)
    email = models.CharField(max_length=32)                             
    id_games = models.ForeignKey(Games, on_delete=models.CASCADE)       #change CASCADE + can be null

class Lobbies(models.Model):
    id_game = models.ForeignKey(Games, on_delete=models.CASCADE)        #change CASCADE
    id_users = models.ForeignKey(Users, on_delete=models.CASCADE)       #change CASCADE
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()
# Create your models here.
class Games(models.Model):
    pass
#on_delete=models.SET_NULL,
#null=True

class Lobbies(models.Model):
    id_game = models.ForeignKey(Games, on_delete=models.SET_NULL, null=True)      
    id_host = models.ForeignKey(User, on_delete=models.SET_NULL, null= True, related_name="host")
    id_player = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="player")

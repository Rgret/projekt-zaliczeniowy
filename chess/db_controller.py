from .models import *

#returns all objects in Users table
#or specific one if given id
def selectUsers(i = 0):
    if(i!=0):
        return Users.objects.get(id = i)
    else:
        return Users.objects.all()

#returns all objects in Lobbies table
#or specific one if given id 
def selectLobbies(i = 0):
    if(i!=0):
        return Lobbies.objects.get(id = i)
    else:
        return Lobbies.objects.all()

#returns all objects in Games table
#or specific one if given id
def selectGames(i = 0):
    if(i!=0):
        return Games.objects.get(id = i)
    else:
        return Games.objects.all()


def get_lobbies_data():
    lobbies_data = []
    lobbies = Lobbies.objects.all()

    for lobby in lobbies:
        lobby_info = {
            'id': lobby.id_game.id if lobby.id_game else None,
            'players': lobby.id_users.id if lobby.id_users else None
        }
        lobbies_data.append(lobby_info)

    return lobbies_data
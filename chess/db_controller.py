from .models import *
from django.db.models import Max
from channels.db import database_sync_to_async

def get_lobbies_data():
    lobbies_data = []
    lobbies = Lobbies.objects.all()

    for lobby in lobbies:
        lobby_info = {
            'lobby_id': lobby.id,
            'game_id': lobby.id_game.id if lobby.id_game else None,
            'host_id': lobby.id_host.id if lobby.id_host else None,
            'host_name': lobby.id_host.username if lobby.id_host else None,
            'player_id': lobby.id_player.id if lobby.id_player else None,
            'player_name': lobby.id_player.username if lobby.id_player else None,
        }
        lobbies_data.append(lobby_info)

    return lobbies_data

# return next id of Games
# curently useless and let's keep it that way
@database_sync_to_async
def next_Games_id():
    result  = Lobbies.objects.aggregate(max_id=Max('id'))
    last_id = result['max_id']

    if last_id is not None:
        return last_id+1
    else:
        # If the table is empty, return 1
        return 1
def sync_next_Games_id():
    result  = Lobbies.objects.aggregate(max_id=Max('id'))
    last_id = result['max_id']

    if last_id is not None:
        return last_id+1
    else:
        # If the table is empty, return 1
        return 1
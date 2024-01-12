from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r"ws/test/$", consumers.GameConsumer.as_asgi()),
    re_path(r"ws/game/(?P<game_id>\w+)/$", consumers.GameConsumer.as_asgi()),
    re_path(r"ws/lobby/(?P<lobby_id>\w+)/$", consumers.LobbyConsumer.as_asgi()),
    re_path(r"ws/lobbies/$", consumers.LobbiesConsumer.as_asgi()), 
]
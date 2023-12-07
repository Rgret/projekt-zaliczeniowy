import json
import random
from django.db import models
from .db_controller import *
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.generic.websocket import WebsocketConsumer

global p_board
p_board = {}

class LobbyConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.send(text_data=json.dumps({
            "type": "start",}))
    def disconnect(self, close_code):
        self.disconnect()

    def receive(self, text_data):
        data = json.loads(text_data)
        host = Users.objects.get(id = data["host"])
        data_type = data["type"]
        if(data_type == "createLobby"):
            newGame = Games()
            newGame.save()
            newLobby = Lobbies(id_game = newGame, id_host = host)
            newLobby.save()
            self.send(text_data=json.dumps({"type": "createLobby", "host": host.id}))

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["game_id"]
        self.room_group_name = f"game_{self.room_name}"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        random.seed(self.room_group_name)
        global p_board
        if(not self.room_group_name in p_board):
            await self.send(text_data=json.dumps({
            "type": "start",
            "top": (int)((random.random()*10)%10), 
            "bottom": (int)((random.random()*10)%10),
            "enemy1": (int)((random.random()*100-50)%10),
            "enemy2": (int)((random.random()*100-50)%10),
            "topCastle": 1,
            "bottomCastle": 81,
            }))
        else:
            print("loaded board")
            await self.send(text_data=json.dumps({"type":"regenBoard", "board": p_board[self.room_group_name]}))

        
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        data_type = data["type"]

        #print(data_type)

        if(data_type == "test"):
            await self.channel_layer.group_send(
            self.room_group_name, {"type": "respond", "test": data_type})

        if(data_type == "move"):
            start = data["start"]
            end = data["end"]
            await self.channel_layer.group_send(
            self.room_group_name, {"type": "move", "start": start, "end": end})

        if(data_type == "regenBoard"):
            board = data["board"]
            await self.channel_layer.group_send(
            self.room_group_name, {"type": "regenBoard", "board": board})

        if(data_type == "endTurn"):
            player = data["player"]
            await self.channel_layer.group_send(
            self.room_group_name, {"type": "endTurn", "player": player})

    async def respond(self, event):
        message = event["test"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"test": message}))

    async def move(self, event):
        start = event["start"]
        end = event["end"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"type": "move", "start": start, "end": end}))

    async def regenBoard(self, event):
        board = event["board"]
        global p_board
        p_board = {self.room_group_name: board}
        # Send message to WebSocket
        await self.send(text_data=json.dumps({"type":"regenBoard", "board": board}))

    async def endTurn(self, event):
        player = event["player"]
        
        # Send message to WebSocket
        await self.send(text_data=json.dumps({"type":"newTurn", "player": player}))
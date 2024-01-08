import json
import random
from django.db import models
from .db_controller import *
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.generic.websocket import WebsocketConsumer
import asyncio

global p_board
p_board = {}

@database_sync_to_async
def get_game(game_id):
    # Synchronous database query
    return Games.objects.get(id=game_id)
@database_sync_to_async
def get_lobby(game):
    lobby = Lobbies.objects.get(id_game = game)
    host_username = lobby.id_host.username if lobby.id_host else None
    player_username = lobby.id_player.username if lobby.id_player else None
    return {'host': host_username, 'player': player_username}
@database_sync_to_async
def remove_game(ID):
    Games.objects.filter(id=ID).delete()

class LobbyConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()
        self.send(text_data=json.dumps({
            "type": "start",}))
    def disconnect(self, close_code):
        self.disconnect()

    def receive(self, text_data):
        data = json.loads(text_data)
        host = User.objects.get(id = data["host"])
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
        global p_board
        game = await get_game(self.scope["url_route"]["kwargs"]["game_id"])
        lobby = await get_lobby(game)

        if(not self.room_group_name in p_board):
            p_board[self.room_group_name] = {'board': None}
            p_board[self.room_group_name][lobby['host']] = {'name': lobby['host'], 'team': 'top', 'gold': 100}
            p_board[self.room_group_name][lobby['player']] = {'name': lobby['player'], 'team': 'bottom', 'gold': 100}
            p_board[self.room_group_name]['turn'] = 'top'
        if(not lobby['host'] in p_board[self.room_group_name]):
            host = lobby['host']
            p_board[self.room_group_name][lobby['host']]['name'] = host
            p_board[self.room_group_name][lobby['host']]['gold'] = 100

        if(not lobby['player'] in p_board[self.room_group_name]):
            player = lobby['player']
            p_board[self.room_group_name][lobby['player']]['name'] = player
            p_board[self.room_group_name][lobby['player']]['gold'] = 100

        await self.send(text_data=json.dumps({"type":"connected", "top": p_board[self.room_group_name][lobby['host']]['name'], 'bottom': p_board[self.room_group_name][lobby['player']]['name'], 
                                              'turn': p_board[self.room_group_name]['turn'],
                                              'gold':{ p_board[self.room_group_name][lobby['host']]['name']: p_board[self.room_group_name][lobby['host']]['gold'],
                                                      p_board[self.room_group_name][lobby['player']]['name']: p_board[self.room_group_name][lobby['player']]['gold'] } }))
        
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
            player = data["player"]
            team = data['team']
            gold = data["gold"]
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "regenBoard", "board": board, 'player': player, 'gold': gold, 'team': team})

        if(data_type == "endTurn"):
            global p_board
            player = data["player"]
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "endTurn", "player": player})
        
        if(data_type == "start"):
            id = data["id"]
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "start", "id": id})

        if(data_type == "clear"):
            global p_board
            p_board = {}
            print("Cleared all boards!")

        if(data_type == "cityRuined"):
            player = data["player"]
            player2 = data["player2"]
            cities = data['cities']
            if cities > 0: return
            remove_game(self.scope["url_route"]["kwargs"]["game_id"])
            if self.room_group_name in p_board:
                del p_board[self.room_group_name]
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "gameEnd", "winner": player})
            

        if(data_type == "askTurn"):
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "askTurn"})
            
        if(data_type == "switchTurn"):
            player = data['player']
            await self.channel_layer.group_send(
                self.room_group_name, {"type": "switchTurn", 'player': player})

    async def start(self, event):
        global p_board
        random.seed(self.room_group_name)
        if(p_board[self.room_group_name]['board']==None):
            #print(p_board[self.room_group_name]['board'])
            await self.send(text_data=json.dumps({
                "type": "start",
                "top": 1, 
                "bottom": 79,
                "enemy1": 8,
                "enemy2": 72,
                "topCastle": 0,
                "bottomCastle": 80,
            }))
        else:
            game = await get_game(self.scope["url_route"]["kwargs"]["game_id"])
            lobby = await get_lobby(game)
            player = lobby['host']
            player2 = lobby['player']
            await self.send(text_data=json.dumps({"type":"regenBoard", "board": p_board[self.room_group_name]['board'], 
                                                  player: p_board[self.room_group_name][player]['gold'], 
                                                  player2: p_board[self.room_group_name][player2]['gold']}))

    async def regenBoard(self, event):
        board = event["board"]
        player = event["player"]
        gold = event["gold"]
        global p_board
        p_board[self.room_group_name]['board'] = board
        p_board[self.room_group_name][player]['gold'] = gold
        for key, value in p_board[self.room_group_name].items():
            if 'team' not in value: continue
            if value["name"] == player: continue
            player2 = value['name']
        # Send message to WebSocket
        #print (p_board[self.room_group_name])
        await self.send(text_data=json.dumps({"type":"regenBoard", "board": board, player: gold, player2: p_board[self.room_group_name][player2]['gold']}))

    async def endTurn(self, event):
        global p_board
        player = event["player"]
        playerTeam = p_board[self.room_group_name][player]['team']
        if playerTeam == 'top': p_board[self.room_group_name]['turn'] = 'bottom'
        p_board[self.room_group_name]['turn'] = 'bottom' if playerTeam == 'top' else 'top'
        for key, value in p_board[self.room_group_name].items():
            if 'team' not in value: continue
            if value["team"] == playerTeam: continue
            hasTurn = value['name']
        # Send message to WebSocket
        await self.send(text_data=json.dumps({"type":"newTurn", 'hasTurn': hasTurn}))
        #self.channel_layer.group_send(
        #    self.room_group_name, {"type": "turn_timer", "turn": p_board[self.room_group_name]['turn'], "timer": 15})

    async def askTurn(self, event):
        global p_board
        turn = p_board[self.room_group_name]['turn']
        await self.send(text_data=json.dumps({"type":"whoseTurn", "turn": turn}))

    async def switchTurn(self, event):
        global p_board
        playerTeam = event['player']
        p_board[self.room_group_name]['turn'] = playerTeam
        await self.send(text_data=json.dumps({"type":"newTurn", 'hasTurn': playerTeam}))

    async def gameEnd(self, event):
        await self.send(text_data=json.dumps({"type": "gameEnd", "winner": event["winner"]}))
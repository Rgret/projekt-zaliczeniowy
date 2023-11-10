import json
from channels.generic.websocket import WebsocketConsumer

def GameConsumer():
    def connect(self):
        self.accept()
        
    def disconnect(self, close_code):
        pass
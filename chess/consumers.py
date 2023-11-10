import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("test", self.channel_name)
        await self.accept()
        
    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        test = text_data_json["test"]

        await self.channel_layer.group_send(
            "test", {"type": "idk.message", "test": test}
        )

    async def idk_message(self, event):
        message = event["test"]

        # Send message to WebSocket
        await self.send(text_data=json.dumps({"test": message}))
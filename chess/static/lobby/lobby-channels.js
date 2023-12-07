const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/lobby/'
);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    switch(data.type){
        case ("start"):
            connected()
        break;
        case ("createLobby"):
            lobbyCreated(data.host)
        break;
    }
}

// called after connecting to a websocket
function connected(){
    console.log("Connected to a websocket!")
}

// called after creating a lobby
function lobbyCreated(e){
    // e == id of player that created the lobby
    console.log("Lobby Created!")
}

// call to create a new lobby takes in id of the player that did this
function createLobby(playerId){
    chatSocket.send(JSON.stringify({
        'type':'createLobby',
        'host': playerId
    }))
}
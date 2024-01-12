const lobbiesSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/lobbies/'
);

lobbiesSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    switch(data.type){
        case ("start"):
            connected()
        break;
        case ("createLobby"):
            lobbyCreated(data.host, data.lobby)
        break;
        case("lobbyList"):
            refreshLobbies(data.lobbyList)
        break;
    }
}

// called after connecting to a websocket
function connected() {
    console.log("Connected to a websocket!")
}

// called after creating a lobby
function lobbyCreated(playerId, lobbyId) {
    console.log(`Lobby Created! ${lobbyId}`)
    joinLobby(lobbyId, playerId)
}

// call to create a new lobby takes in id of the player that did this
function createLobby(playerId) {
    lobbiesSocket.send(JSON.stringify({
        'type':'createLobby',
        'host': playerId
    }))
}


// called to get the list of lobbies
function getLobbies() {
    lobbiesSocket.send(JSON.stringify({
        'type':'getLobbies',
    }))
}

// called after getting the list of lobbies
function refreshLobbies(lobbyList) {
// lobbyList structure
    // { id_lobby: { 
    //      host: {id: id, username: username}, 
    //      player: {id: id, username: username}, 
    //      game: game id
    //      }
    // }    
    console.log(lobbyList)
}


function onMessage(e) {
    const data = JSON.parse(e.data);
    switch(data.type){
        case ("connected"):
            console.log("Connected to lobby")
            lobbySocket.send(JSON.stringify({
                'type':'joinLobby',
                'player': p_id
            }))
        break;
        case ("newJoin"):
            console.log(`Player ${data.player} has joined the lobby!`)
        break;
        case ("lobbyFull"):
            lobbyFull()
        break;
        case ("leftLobby"):
            leftLobby()
            lobbySocket.close()
        break;
    }
}

let p_id;
let lobbySocket;
// use to join a lobby, needs the lobby id and player id
function joinLobby(lobbyId, playerId) {
    lobbySocket = new WebSocket(
        'ws://'
        + window.location.host
        + '/ws/lobby/'
        + lobbyId
        + '/'
    )
    p_id = playerId

    lobbySocket.onmessage = onMessage

    return p_id
}

// user will leave the lobby he is currently in
function leaveLobby() {
    lobbySocket.send(JSON.stringify({
        'type':'leaveLobby',
        'player': p_id
    }))
}

// called when user leaves the lobby
function leftLobby() {
    console.log("Left the lobby.")
}

// called when the lobby is full
function lobbyFull() {
    console.log("Lobby is full!")
}
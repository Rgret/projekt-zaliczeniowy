var lobbies = null
var lbId = null

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
            console.log(data)
            getLobbies()
            lobbyCreated(data.host, data.lobby)
        break;
        case("lobbyList"):
            lobbies = Object.values(data.lobbyList)
            refreshLobbies(lobbies)
        break;
    }
}

// called after connecting to a websocket
function connected() {
    console.log("Connected to a websocket!")
    getLobbies()
}

function genLobbies(lobbies) {
    lobbyList.innerHTML = ''

    const button = document.createElement("button");
    button.className = "lobbyItem";
    button.onclick = createLobby;
    button.textContent = "Create lobby";
    lobbyList.appendChild(button)
    lobbies.forEach(e => {
        if (e.host.id == player_id || e.player.id == player_id) lbId = e.id; else lbId = null;
        let container = document.createElement("div")
        container.classList += " lobbyItem"
        container.id = e.id
        container.innerText = `Lobby ${e.id}  -  Host: ${e.host.username}` 
        container.addEventListener('click', e=> {showLobbyDetails(e)})
        lobbyList.appendChild(container)
    })
    if (lbId != null){
        showLobbyDetails(null, lbId)
        joinLobby(lbId, player_id)
    }else {
        lobbyDetails.innerHTML = ''
        actionButtons.innerHTML = ''
    }
}

// called after creating a lobby
function lobbyCreated(playerId, lobbyId) {
    console.log(`Lobby Created! ${lobbyId}`)
    lbId = lobbyId
    joinLobby(lobbyId, playerId)
    lobbySocket = new WebSocket(
        'ws://'
        + window.location.host
        + '/ws/lobby/'
        + lobbyId
        + '/'
    )
}

// call to create a new lobby takes in id of the player that did this
function createLobby() {
    if (lbId != null) return;
    lobbiesSocket.send(JSON.stringify({
        'type':'createLobby',
        'host': player_id
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
    //      id: id_lobby
    //      host: {id: id, username: username}, 
    //      player: {id: id, username: username}, 
    //      game: game id
    //      }
    // }
    genLobbies(lobbyList)    
}


function onMessage(e) {
    const data = JSON.parse(e.data);
    switch(data.type){
        case ("connected"):
            console.log(`Connected to lobby ${lbId}`)
            if (lbId != null) return;
            lobbySocket.send(JSON.stringify({
                'type':'joinLobby',
                'player': p_id
            }))
        break;
        case ("newJoin"):
            console.log(`Player ${data.player} has joined the lobby!`)
            getLobbies()
        break;
        case ("lobbyFull"):
            lobbyFull()
        break;
        case ("leftLobby"):
            console.log(data)
            if (data.player_id != player_id) {getLobbies(); return;}
            leftLobby()
            lobbySocket.close()
        break;
        case ("startGame"):
            console.log(data)
            window.location.href = `/game/${data.game}`;
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
    getLobbies()
}

// called when the lobby is full
function lobbyFull() {
    console.log("Lobby is full!")
}
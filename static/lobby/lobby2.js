const lobbyList = document.getElementById('lobbyList');
const lobbyDetails = document.getElementById('lobbyDetails');
const actionButtons = document.getElementById('actionButtons');
const leftPanel = document.getElementById('leftPanel');
const player_id = JSON.parse(document.getElementById('id').textContent);

function showLobbyDetails(e = null, id = null) {
  lobby = lobbies.filter(f => {return f.id == (e != null ? e.target.id : id)})[0];

  lobbyDetails.innerHTML = `<h2>lobby: ${lobby.id}</h2>
  <p>Host: ${lobby.host.username}</p>
  <p>Player: ${lobby.player.username != null ? lobby.player.username : "None"}</p>`;
  showActionButtons(lobby.id); 
}

function showActionButtons(lobbyId) {
  // Remove existing buttons if any
  actionButtons.innerHTML = '';

  // Create buttons dynamically
  const startGameButton = document.createElement('button');
  startGameButton.textContent = 'Start Game';
  startGameButton.addEventListener('click', () => startGame(lobbyId));

  const joinLobbyButton = document.createElement('button');
  joinLobbyButton.textContent = 'Join Lobby';
  joinLobbyButton.addEventListener('click',() => joinLobby(lobbyId, player_id))

  const leaveLobbyButton = document.createElement('button');
  leaveLobbyButton.textContent = 'Leave Lobby';
  leaveLobbyButton.addEventListener('click',() => leaveLobby())

  // Append buttons to the actionButtons div
  actionButtons.appendChild(startGameButton);
  actionButtons.appendChild(joinLobbyButton);

  if (lbId == lobbyId) [
    actionButtons.appendChild(leaveLobbyButton)
  ]
}

function startGame(lobbyId) {
  if (lbId != lobbyId) return;
  var lb = lobbies.filter(f => {return f.id == lobbyId})[0];
  if (lb.player.id == null) return;
  console.log("starting")
  lobbySocket.send(JSON.stringify({
    'type':'startGame',
    'game': lb.game,
  }))
}

function togglePanel() {
  leftPanel.style.width = leftPanel.style.width === '33.33%' ? '0' : '33.33%';
}
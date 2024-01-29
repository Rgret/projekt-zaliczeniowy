const lobbyList = document.getElementById('lobbyList');
const lobbyDetails = document.getElementById('lobbyDetails');
const actionButtons = document.getElementById('actionButtons');
const leftPanel = document.getElementById('leftPanel');

// Dummy data
const lobbies = [
  { id: 1, players: 4 },
  { id: 2,  players: 2 }, 
];

// Populate the lobby list
lobbies.forEach(lobby => {
  const lobbyItem = document.createElement('div');
  lobbyItem.classList.add('lobbyItem');
  lobbyItem.textContent = ` Lobby ${lobby.id} - Players: ${lobby.players}`;
  lobbyItem.addEventListener('click', () => showLobbyDetails(lobby));
  lobbyList.appendChild(lobbyItem);
});

function showLobbyDetails(lobby) {
  lobbyDetails.innerHTML = `<h2>${lobby.id}</h2><p>Players: ${lobby.players}</p>`;
  showActionButtons();
}

function showActionButtons() {
  // Remove existing buttons if any
  actionButtons.innerHTML = '';

  // Create buttons dynamically
  const startGameButton = document.createElement('button');
  startGameButton.textContent = 'Start Game';
  startGameButton.onclick = startGame;

  const joinLobbyButton = document.createElement('button');
  joinLobbyButton.textContent = 'Join Lobby';
  joinLobbyButton.onclick = joinLobby;

  // Append buttons to the actionButtons div
  actionButtons.appendChild(startGameButton);
  actionButtons.appendChild(joinLobbyButton);
}

function togglePanel() {
  leftPanel.style.width = leftPanel.style.width === '33.33%' ? '0' : '33.33%';
}

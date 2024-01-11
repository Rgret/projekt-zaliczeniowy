const lobbyList = document.getElementById('lobbyList');
const lobbyDetails = document.getElementById('lobbyDetails');
const actionButtons = document.getElementById('actionButtons');
const leftPanel = document.getElementById('leftPanel');



function showLobbyDetails(lobby) {
  lobbyDetails.innerHTML = `<h2>lobby: ${lobby.id}</h2><p>Players: ${lobby.players}</p>`;
  showActionButtons(lobby.id); 
}

function showActionButtons(lobbyId) {
  // Remove existing buttons if any
  actionButtons.innerHTML = '';

  // Create buttons dynamically
  const startGameButton = document.createElement('button');
  startGameButton.textContent = 'Start Game';
  startGameButton.addEventListener('click', () => startGame(lobbyId)); // Pass lobbyId to startGame function

  const joinLobbyButton = document.createElement('button');
  joinLobbyButton.textContent = 'Join Lobby';

  // Append buttons to the actionButtons div
  actionButtons.appendChild(startGameButton);
  actionButtons.appendChild(joinLobbyButton);
}

function startGame(lobbyId) {
  // Redirect to the game page with the lobby ID
  window.location.href = `/game/${lobbyId}`; // Use lobbyId to construct the URL
}

function togglePanel() {
  leftPanel.style.width = leftPanel.style.width === '33.33%' ? '0' : '33.33%';
}
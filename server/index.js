const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });

const players = new Map();
let playerOneScore = 0;
let playerTwoScore = 0;
let round = 0;
let choices = {};

server.on('connection', (socket) => {
  if (players.size >= 2) {
    socket.send('Sorry, the game is already full. Try again later.');
    socket.close();
    return;
  }

  resetGame();

  const playerId = generateUniqueId();
  players.set(playerId, socket);

  socket.send(`You are Player ${playerId}`);
  broadcastPlayersScores();

  broadcast(`Player ${playerId} has joined the game`);

  socket.on('message', (message) => {
    const { type, value } = JSON.parse(message);

    switch (type) {
      case 'choice':
        choices[playerId] = value;

        if (Object.keys(choices).length === 2) {
          const result = determineWinner(
            choices[getPlayerId(1)],
            choices[getPlayerId(2)]
          );

          incrementScore(result);

          broadcast(
            `Player 1 chose ${choices[getPlayerId(1)]}, Player 2 chose ${
              choices[getPlayerId(2)]
            }`
          );
          broadcast(`Result: ${result}`);
          broadcastPlayersScores();

          if (playerOneScore === 2 || playerTwoScore === 2) {
            if (playerOneScore > playerTwoScore) {
              broadcast(`Player ${getPlayerId(1)} is the winner!`);
            } else {
              broadcast(`Player ${getPlayerId(2)} is the winner!`);
            }

            resetGame();
          } else {
            choices = {};
            round++;
            broadcast(`Starting round ${round + 1}`);
          }
        }
        break;

      default:
        console.log(`Unsupported message type: ${type}`);
    }
  });

  socket.on('close', () => {
    players.delete(playerId);
    broadcast(`Player ${playerId} has left the game`);

    resetGame();
  });
});

function broadcast(message) {
  players.forEach((player) => {
    player.send(message);
  });
}

function broadcastPlayersScores() {
  const scoresMessage = `Player 1 Score: ${getPlayerScore(
    getPlayerId(1)
  )}, Player 2 Score: ${getPlayerScore(getPlayerId(2))}`;

  players.forEach((player) => {
    player.send(scoresMessage);
  });
}

function getPlayerScore(playerId) {
  return playerId === getPlayerId(1) ? playerOneScore : playerTwoScore;
}

function incrementScore(result) {
  if (result.includes('Player 1')) {
    playerOneScore++;
  } else if (result.includes('Player 2')) {
    playerTwoScore++;
  }
}

function determineWinner(choice1, choice2) {
  if (choice1 === choice2) {
    return "It's a tie!";
  } else if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'paper' && choice2 === 'rock') ||
    (choice1 === 'scissors' && choice2 === 'paper')
  ) {
    return `Player 1 wins round ${round + 1}!`;
  } else {
    return `Player 2 wins round ${round + 1}!`;
  }
}

function resetGame() {
  playerOneScore = 0;
  playerTwoScore = 0;
  round = 0;
  choices = {};
}

function generateUniqueId() {
  return Math.random().toString(36).substr(2, 9);
}

function getPlayerId(playerNumber) {
  return Array.from(players.keys())[playerNumber - 1];
}

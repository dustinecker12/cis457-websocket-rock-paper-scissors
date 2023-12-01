const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 3000 });

const players = [];
let playerOneScore = 0;
let playerTwoScore = 0;
let round = 0;
let choices = {};

server.on('connection', (socket) => {
  if (players.length >= 2) {
    socket.send('Sorry, the game is already full. Try again later.');
    socket.close();
    return;
  }

  resetGame();

  players.push(socket);

  const playerNumber = players.length;

  socket.send(`You are Player ${playerNumber}`);

  broadcast(`Player ${playerNumber} has joined the game`);

  socket.on('message', (message) => {
    const { type, value } = JSON.parse(message);

    switch (type) {
      case 'choice':
        choices[playerNumber] = value;

        if (Object.keys(choices).length === 2) {
          const result = determineWinner(choices[1], choices[2]);
          broadcast(
            `Player 1 chose ${choices[1]}, Player 2 chose ${choices[2]}`
          );
          broadcast(`Result: ${result}`);

          if (playerOneScore === 2 || playerTwoScore === 2) {
            if (playerOneScore > playerTwoScore) {
              broadcast('Player 1 is the winner!');
            } else {
              broadcast('Player 2 is the winner!');
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
    players.splice(players.indexOf(socket), 1);
    broadcast(`Player ${playerNumber} has left the game`);

    resetGame();
  });
});

function broadcast(message) {
  players.forEach((player) => {
    player.send(message);
  });
}

function determineWinner(choice1, choice2) {
  if (choice1 === choice2) {
    return "It's a tie!";
  } else if (
    (choice1 === 'rock' && choice2 === 'scissors') ||
    (choice1 === 'paper' && choice2 === 'rock') ||
    (choice1 === 'scissors' && choice2 === 'paper')
  ) {
    playerOneScore++;
    return `Player 1 wins round ${round + 1}!`;
  } else {
    playerTwoScore++;
    return `Player 2 wins round ${round + 1}!`;
  }
}

function resetGame() {
  playerOneScore = 0;
  playerTwoScore = 0;
  round = 0;
  choices = {};
}

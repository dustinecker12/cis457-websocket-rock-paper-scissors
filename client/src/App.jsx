import { useEffect, useState } from 'react';
import './App.css';

import rockLeft from './assets/rock-left.png';
import rockRight from './assets/rock-right.png';
import paperLeft from './assets/paper-left.png';
import paperRight from './assets/paper-right.png';
import scissorsLeft from './assets/scissors-left.png';
import scissorsRight from './assets/scissors-right.png';
import unchecked from './assets/unchecked.png';
import checked from './assets/checked.png';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [waitingForOtherPlayer, setWaitingForOtherPlayer] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    ws.addEventListener('open', () => {
      console.log('Connected to the server');
    });

    ws.addEventListener('message', (event) => {
      const message = event.data;
      updateStatus(message);

      if (message.includes('waiting')) {
        setWaitingForOtherPlayer(true);
      } else {
        setWaitingForOtherPlayer(false);
      }
    });

    ws.addEventListener('close', () => {
      console.log('Connection closed');
    });

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const makeChoice = (choice) => {
    if (waitingForOtherPlayer) {
      alert('Waiting for the other player to make a choice.');
      return;
    }

    const message = JSON.stringify({ type: 'choice', value: choice });
    socket.send(message);
    updateStatus('Waiting for other player...');
  };

  const updateStatus = (message) => {
    setStatus(message);
  };

  return (
    <div className="game">
      <div className="header">
        <h1>Rock Paper Scissors Game</h1>
        <div>
          <img src={checked} alt="Checked Win Box" />
          <img src={unchecked} alt="Unchecked Win Box" />
          <img src={unchecked} alt="Unchecked Win Box" />
        </div>
      </div>
      <div className="gameBoard">
        <img
          className="playerOneChoice"
          src={rockRight}
          alt="Player One Choice"
        />
        <div className="verticalBar"></div>
        <img
          className="playerTwoChoice"
          src={rockLeft}
          alt="Player Two Choice"
        />
      </div>
      <div className="footer">
        <div>{status}</div>
        <div className="buttonGroup">
          <button className="rpsButton" onClick={() => makeChoice('rock')}>
            <img src={rockRight} alt="Rock" />
          </button>
          <button className="rpsButton" onClick={() => makeChoice('paper')}>
            <img src={paperRight} alt="Paper" />
          </button>
          <button className="rpsButton" onClick={() => makeChoice('scissors')}>
            <img src={scissorsRight} alt="Scissors" />
          </button>
        </div>
        <p className="author">By Dustin Ecker & Matthew Isip</p>
      </div>
    </div>
  );
};

export default App;

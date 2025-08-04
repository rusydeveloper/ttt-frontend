import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [player, setPlayer] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');

  useEffect(() => {
    socket.on('playerAssignment', (symbol) => setPlayer(symbol));
    socket.on('gameState', ({ board, currentTurn }) => {
      setBoard(board);
      setTurn(currentTurn);
    });
    socket.on('playerLeft', () => {
      alert('Opponent left the game. Reload to restart.');
      window.location.reload();
    });
  }, []);

  const handleClick = (index) => {
    if (!board[index] && player === turn) {
      socket.emit('makeMove', index);
    }
  };

  return (
    <div>
      <h2>You are: {player}</h2>
      <h3>{turn === player ? "Your turn" : "Opponent's turn"}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)' }}>
        {board.map((cell, idx) => (
          <div key={idx}
            onClick={() => handleClick(idx)}
            style={{
              width: 100,
              height: 100,
              border: '1px solid black',
              fontSize: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

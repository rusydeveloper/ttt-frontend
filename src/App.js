import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://ttt-backend-aged-fire-8741.fly.dev'); // 🔁 Update to your deployed backend
function App() {
  const [player, setPlayer] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [opponent, setOpponent] = useState(null);


  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🐱');
  const avatarOptions = ['🐱', '🐶', '🐵', '🐸', '🐼', '🦊'];

  useEffect(() => {
    socket.on('playerAssignment', (symbol) => {
      setPlayer(symbol);
      if (!name || !avatar) return;
      socket.emit('registerPlayer', { name, avatar });
    });

    socket.on('gameState', ({ board, currentTurn }) => {
      setBoard(board);
      setTurn(currentTurn);
      setWinner(null);
    });

    socket.on('gameOver', ({ board, winner }) => {
      setBoard(board);
      setWinner(winner);
    });

    socket.on('playerInfo', (data) => {
      setOpponent(data.opponent);
      setName(data.you.name); // confirm local state
      setAvatar(data.you.avatar);
    });

    socket.on('playerLeft', () => {
      alert('Opponent left the game. Reloading...');
      window.location.reload();
    });

    return () => {
      socket.off('playerAssignment');
      socket.off('gameState');
      socket.off('gameOver');
      socket.off('playerLeft');
      socket.off('playerInfo');
    };
  }, [name, avatar]);

  const handleClick = (index) => {
    if (!board[index] && player === turn && !winner) {
      socket.emit('makeMove', index);
    }
  };

  const handleReset = () => {
    window.location.reload(); // keep it simple for now
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {!player && (
        <div style={{ marginBottom: '1rem' }}>
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginRight: '10px', padding: '4px' }}
          />
          <select value={avatar} onChange={(e) => setAvatar(e.target.value)}>
            {avatarOptions.map((a, i) => (
              <option key={i} value={a}>{a}</option>
            ))}
          </select>
        </div>
      )}

      {player && (
        <>
          <h2>{avatar} {name || `Player ${player}`}</h2>
          <h3>
            {winner
              ? (winner === 'draw' ? 'Draw!' : `Player ${winner} wins!`)
              : (turn === player ? 'Your turn' : 'Opponent’s turn')}
          </h3>
          {opponent && (
            <h3>👤 Opponent: {opponent.avatar} {opponent.name || 'Waiting...'}</h3>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 100px)',
            gap: '5px',
            marginBottom: '20px'
          }}>
            {board.map((cell, idx) => (
              <div
                key={idx}
                onClick={() => handleClick(idx)}
                style={{
                  width: 100,
                  height: 100,
                  border: '2px solid #333',
                  fontSize: '2rem',
                  textAlign: 'center',
                  lineHeight: '100px',
                  cursor: !cell && !winner && player === turn ? 'pointer' : 'default',
                  backgroundColor: cell ? '#eee' : '#fff'
                }}
              >
                {cell}
              </div>
            ))}
          </div>

          {winner && (
            <button onClick={handleReset}>Play Again</button>
          )}
        </>
      )}
    </div>
  );
}

export default App;

import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://ttt-backend-aged-fire-8741.fly.dev'); // 🔁 Update to your deployed backend
function App() {
  const [player, setPlayer] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [turn, setTurn] = useState('X');
  const [winner, setWinner] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [waitingRematch, setWaitingRematch] = useState(false);
  const [countdown, setCountdown] = useState(null);


  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🐱');
  const avatarOptions = ['🐱', '🐶', '🐵', '🐸', '🐼', '🦊'];

  const [score, setScore] = useState({
    wins: 0,
    losses: 0,
    draws: 0
  });

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
      setWaitingRematch(false);
      setCountdown(null);
    });



    socket.on('gameOver', ({ board, winner }) => {
      setBoard(board);
      setWinner(winner);

      setScore(prev => {
        if (winner === 'draw') {
          return { ...prev, draws: prev.draws + 1 };
        } else if (winner === player) {
          return { ...prev, wins: prev.wins + 1 };
        } else {
          return { ...prev, losses: prev.losses + 1 };
        }
      });
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

    socket.on('rematchStartingIn', ({ seconds }) => {
      setCountdown(seconds);
    });

    return () => {
      socket.off('playerAssignment');
      socket.off('gameState');
      socket.off('gameOver');
      socket.off('playerLeft');
      socket.off('playerInfo');
      socket.off('rematchStartingIn');
    };
  }, [name, avatar]);

  const handleClick = (index) => {
    if (!board[index] && player === turn && !winner) {
      socket.emit('makeMove', index);
    }
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
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '10px',
            maxWidth: '150px'
          }}>
            <h4>🧮 Score</h4>
            <p>✅ Wins: {score.wins}</p>
            <p>❌ Losses: {score.losses}</p>
            <p>⚖️ Draws: {score.draws}</p>
          </div>

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
          {countdown !== null && (
            <h3>⏳ New game starting in: {countdown}</h3>
          )}

          {winner && !waitingRematch && (
            <button onClick={() => {
              socket.emit('requestRematch');
              setWaitingRematch(true);
            }}>
              Play Again
            </button>
          )}

          {winner && waitingRematch && (
            <p>Waiting for opponent to confirm...</p>
          )}
        </>
      )}
    </div>
  );
}

export default App;

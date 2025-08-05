import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('https://ttt-backend-aged-fire-8741.fly.dev');

function GameRoom({ roomId, name, avatar }) {
    const [player, setPlayer] = useState(null);
    const [opponent, setOpponent] = useState(null);
    const [board, setBoard] = useState(Array(9).fill(null));
    const [turn, setTurn] = useState('X');
    const [winner, setWinner] = useState(null);
    const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
    const [waitingRematch, setWaitingRematch] = useState(false);
    const [countdown, setCountdown] = useState(null);

    useEffect(() => {
        socket.emit('joinRoom', { roomId, name, avatar });

        socket.on('playerAssignment', (symbol) => setPlayer(symbol));
        socket.on('playerInfo', (data) => setOpponent(data.opponent));
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
                if (winner === 'draw') return { ...prev, draws: prev.draws + 1 };
                if (winner === player) return { ...prev, wins: prev.wins + 1 };
                return { ...prev, losses: prev.losses + 1 };
            });
        });
        socket.on('rematchStartingIn', ({ seconds }) => {
            setCountdown(seconds);
        });
        socket.on('playerLeft', () => {
            alert('Opponent left the room. Please go back to lobby.');
            window.location.reload();
        });

        return () => socket.disconnect();
    }, [roomId, name, avatar]);

    const handleClick = (index) => {
        if (!board[index] && player === turn && !winner) {
            socket.emit('makeMove', { roomId, index });
        }
    };

    const handleRematch = () => {
        socket.emit('requestRematch', { roomId });
        setWaitingRematch(true);
    };

    return (
        <div>
            <h2>Room: {roomId}</h2>
            <h3>{avatar} {name} ({player})</h3>
            {opponent && <h4>👤 Opponent: {opponent.avatar} {opponent.name}</h4>}
            <h4>{winner ? (winner === 'draw' ? 'Draw!' : `Player ${winner} wins!`) :
                (turn === player ? 'Your turn' : 'Opponent’s turn')}</h4>

            {countdown !== null && <p>⏳ New game starting in {countdown}...</p>}

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
                !waitingRematch
                    ? <button onClick={handleRematch}>Play Again</button>
                    : <p>Waiting for opponent...</p>
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
        </div>
    );
}

export default GameRoom;

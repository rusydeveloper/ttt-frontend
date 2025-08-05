import { useState } from 'react';

function Lobby({ roomId, setRoomId, playerInfo, setPlayerInfo, onJoin }) {
    const [error, setError] = useState('');

    const handleJoin = () => {
        if (!roomId || !playerInfo.name) {
            setError('Please enter both Room ID and your name');
            return;
        }
        setError('');
        onJoin();
    };

    const avatarOptions = ['🐱', '🐶', '🐵', '🐸', '🐼', '🦊'];

    return (
        <div>
            <h2>🎮 Join a Game Room</h2>

            <input
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                style={{ marginRight: '10px', padding: '5px' }}
            />
            <br /><br />

            <input
                placeholder="Your Name"
                value={playerInfo.name}
                onChange={(e) => setPlayerInfo({ ...playerInfo, name: e.target.value })}
                style={{ marginRight: '10px', padding: '5px' }}
            />

            <select
                value={playerInfo.avatar}
                onChange={(e) => setPlayerInfo({ ...playerInfo, avatar: e.target.value })}
                style={{ marginLeft: '10px', padding: '5px' }}
            >
                {avatarOptions.map((a, i) => (
                    <option key={i} value={a}>{a}</option>
                ))}
            </select>

            <br /><br />

            <button onClick={handleJoin}>Join Room</button>

            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

export default Lobby;
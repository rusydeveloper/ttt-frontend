import { useState } from 'react';
import Lobby from './Lobby';
import GameRoom from './GameRoom';

function App() {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [playerInfo, setPlayerInfo] = useState({ name: '', avatar: '🐱' });

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      {!joined ? (
        <Lobby
          roomId={roomId}
          setRoomId={setRoomId}
          playerInfo={playerInfo}
          setPlayerInfo={setPlayerInfo}
          onJoin={() => setJoined(true)}
        />
      ) : (
        <GameRoom
          roomId={roomId}
          name={playerInfo.name}
          avatar={playerInfo.avatar}
        />
      )}
    </div>
  );
}

export default App;

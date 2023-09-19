import Board from './Board'
import { Routes, Route, HashRouter } from 'react-router-dom';

function App() {

  return (
    <HashRouter >
      <Routes>
        <Route path="/" element={<Board />}/>
        <Route path=":gameId">
          <Route path=":playerId" element={<Board />}/>
        </Route>
      </Routes>
    </HashRouter >
  );
}

export default App;

import React from 'react';
import { Board } from './components/Board';

function App() {
  return (
    <div className="min-h-screen w-full text-slate-200 selection:bg-indigo-500/30">
      <Board />
    </div>
  );
}

export default App;

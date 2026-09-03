import { useState } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [refreshToken, setRefreshToken] = useState(0);
  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="brand-mark">TASK / 01</p>
        <h1>Make room<br /><em>for what matters.</em></h1>
        <p className="intro">A simple, quiet place to keep your next actions close.</p>
      </header>
      <div className="workspace">
        <TaskForm onCreated={() => setRefreshToken((value) => value + 1)} />
        <TaskList refreshToken={refreshToken} />
      </div>
    </main>
  );
}

export default App;
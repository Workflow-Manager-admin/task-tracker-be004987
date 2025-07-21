import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { supabase } from './supabaseClient';
import {
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompleted
} from './supabaseTodos';

// PUBLIC_INTERFACE
/**
 * Login form and session handler UI component.
 * Handles login (email/password or magic link), logout, and keeps user logged in on refresh.
 */
function AuthUI({ session, setSession }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'magic'

  // PUBLIC_INTERFACE
  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  async function handleMagicLink(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) setError(error.message);
    else setError('Check your email for the magic link.');
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  }

  if (session) {
    const userEmail = session.user?.email || '(unknown)';
    return (
      <div style={{ marginBottom: 32 }}>
        <p>Signed in as <strong>{userEmail}</strong></p>
        <button className="theme-toggle" style={{fontSize:16,marginBottom:8}} onClick={handleLogout} disabled={loading}>
          {loading ? 'Signing out...' : 'Sign out'}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: 24,
      border: '1px solid var(--border-color)',
      borderRadius: 12,
      background: 'var(--bg-secondary)',
      marginBottom: 32,
      maxWidth: 350,
      marginLeft: 'auto',
      marginRight: 'auto'
    }}>
      <h2>Sign In</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, justifyContent: 'center' }}>
        <button className="theme-toggle"
          style={{
            background: authMode === 'login' ? 'var(--button-bg)' : 'var(--border-color)',
            color: authMode === 'login' ? 'var(--button-text)' : 'var(--text-primary)'
          }}
          onClick={() => setAuthMode('login')}
        >Email/Password</button>
        <button className="theme-toggle"
          style={{
            background: authMode === 'magic' ? 'var(--button-bg)' : 'var(--border-color)',
            color: authMode === 'magic' ? 'var(--button-text)' : 'var(--text-primary)'
          }}
          onClick={() => setAuthMode('magic')}
        >Magic Link</button>
      </div>
      {authMode === 'login' && (
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{marginBottom:8, width:'100%',padding:8, fontSize:15}}
          /><br />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            minLength={6}
            style={{marginBottom:14, width:'100%',padding:8, fontSize:15}}
          /><br />
          <button className="theme-toggle" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      )}
      {authMode === 'magic' && (
        <form onSubmit={handleMagicLink}>
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{marginBottom:14, width:'100%',padding:8, fontSize:15}}
          /><br />
          <button className="theme-toggle" type="submit" disabled={loading}>
            {loading ? 'Sending link...' : 'Send Magic Link'}
          </button>
        </form>
      )}
      {error && <div style={{color:'#b22',marginTop:10}}>{error}</div>}
    </div>
  );
}
/**
 * App - Main application with Supabase Auth integration.
 * Provides login/logout, persists user across refresh, and exposes a placeholder for main content UI.
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [session, setSession] = useState(null);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // On mount, fetch session (user may stay logged in on refresh)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    // Cleanup sub
    return () => {
      listener.subscription?.unsubscribe && listener.subscription.unsubscribe();
    };
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="App">
      <header className="App-header">
        <button 
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        {/* Auth UI */}
        <AuthUI session={session} setSession={setSession} />
        {session ? (
          <>
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Welcome! You are signed in.<br />
            </p>
            <TodoList />
            <p>
              Current theme: <strong>{theme}</strong>
            </p>
          </>
        ) : (
          <>
          <img src={logo} className="App-logo" alt="logo" />
          <p>Sign in to access your todo list.</p>
          <p>
            Current theme: <strong>{theme}</strong>
          </p>
          </>
        )}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

/**
 * TodoList - Displays and manages all user's todos via Supabase.
 * Handles create, edit, delete, complete/incomplete, and list actions.
 */
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [error, setError] = useState('');

  // Load todos on mount
  useEffect(() => {
    retrieveTodos();
  }, []);

  async function retrieveTodos() {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (e) {
      setError('Failed to load todos. ' + (e.message || e));
    }
    setLoading(false);
  }

  // PUBLIC_INTERFACE
  async function handleAddTodo(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setError('');
    try {
      const todo = await addTodo(input.trim());
      setTodos([todo, ...todos]);
      setInput('');
    } catch (e) {
      setError('Add failed: ' + (e.message || e));
    }
  }

  // PUBLIC_INTERFACE
  async function handleDeleteTodo(id) {
    setError('');
    try {
      await deleteTodo(id);
      setTodos(todos.filter(t => t.id !== id));
    } catch (e) {
      setError('Delete failed: ' + (e.message || e));
    }
  }

  // PUBLIC_INTERFACE
  async function handleToggleCompleted(id, completed) {
    setError('');
    try {
      const updated = await toggleTodoCompleted(id, !completed);
      setTodos(todos.map(t => t.id === id ? updated : t));
    } catch (e) {
      setError('Toggle failed: ' + (e.message || e));
    }
  }

  // PUBLIC_INTERFACE
  async function handleEditTodo(id, newText) {
    if (!newText.trim()) return;
    setError('');
    try {
      const updated = await updateTodo(id, newText.trim());
      setTodos(todos.map(t => t.id === id ? updated : t));
      setEditId(null);
      setEditText('');
    } catch (e) {
      setError('Edit failed: ' + (e.message || e));
    }
  }

  return (
    <div style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      padding: 24,
      borderRadius: 16,
      maxWidth: 400,
      margin: '0 auto',
      marginBottom: 36,
      border: '1px solid var(--border-color)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
    }}>
      <h3>Your Todo List</h3>
      <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Add a new task…"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{
            flex: 1,
            padding: 8,
            fontSize: 16,
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
          }}
          aria-label="Add todo"
          required
        />
        <button
          className="theme-toggle"
          type="submit"
          disabled={loading || !input.trim()}>
          +
        </button>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : todos.length === 0 ? (
        <div style={{color: 'var(--text-secondary)'}}>No todos yet.</div>
      ) : (
        <ul style={{
          listStyle: 'none',
          padding: 0,
        }}>
          {todos.map(todo => (
            <li key={todo.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 0',
              borderBottom: '1px solid var(--border-color)',
              transition: 'background 0.2s',
              background: todo.completed ? 'var(--bg-secondary)' : undefined,
              opacity: todo.completed ? 0.5 : 1
            }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggleCompleted(todo.id, todo.completed)}
                aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
              />
              {editId === todo.id ? (
                <>
                  <input
                    value={editText}
                    autoFocus
                    style={{
                      flex: 1,
                      padding: 6,
                      fontSize: 15,
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                    }}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        handleEditTodo(todo.id, editText);
                      } else if (e.key === "Escape") {
                        setEditId(null);
                        setEditText('');
                      }
                    }}
                  />
                  <button
                    className="theme-toggle"
                    style={{ fontSize: 13, padding: '4px 10px', marginLeft: 4 }}
                    onClick={() => handleEditTodo(todo.id, editText)}
                  >Save</button>
                  <button
                    className="theme-toggle"
                    style={{ fontSize: 13, padding: '4px 10px', marginLeft: 2, background: 'var(--border-color)', color: 'var(--text-primary)' }}
                    onClick={() => { setEditId(null); setEditText(''); }}
                  >Cancel</button>
                </>
              ) : (
                <>
                  <span
                    style={{
                      flex: 1,
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? 'var(--text-secondary)' : 'inherit',
                      fontSize: 16,
                    }}
                  >{todo.text}</span>
                  {!todo.completed &&
                    <button
                      className="theme-toggle"
                      style={{ fontSize: 14, padding: '4px 10px', background: 'var(--border-color)', color: 'var(--text-primary)' }}
                      onClick={() => { setEditId(todo.id); setEditText(todo.text); }}
                      aria-label="Edit todo"
                    >Edit</button>
                  }
                  <button
                    className="theme-toggle"
                    style={{ fontSize: 14, padding: '4px 10px', background: '#c41e1e', color: '#fff' }}
                    onClick={() => handleDeleteTodo(todo.id)}
                    aria-label="Delete todo"
                  >Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {error && <div style={{ color: '#b22', marginTop: 12 }}>{error}</div>}
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { supabase } from './supabaseClient';

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
            {/* Main app goes here */}
            {/* TODO: Replace this line with todo list UI wired to Supabase */}
          </p>
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

export default App;

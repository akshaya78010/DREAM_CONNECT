import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import axios from 'axios';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length > 0) {
      setSearchOpen(true);
      try {
        const res = await axios.get(`http://localhost:3000/api/users/search?query=${val}`);
        setResults(res.data);
      } catch (err) {
          console.error('Search error:', err);
      }
    } else {
      setSearchOpen(false);
      setResults([]);
    }
  };

  const goToProfile = (id) => {
    setSearchOpen(false);
    setQuery('');
    navigate(`/profile/${id}`);
  };

  return (
    <nav className="glass" style={{padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: '2rem'}}>
        <Link to="/" style={{textDecoration: 'none'}}>
          <h1 style={{margin: 0, fontSize: '1.5rem', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800}}>
            DreamConnect
          </h1>
        </Link>
        {user && (
          <div style={{position: 'relative'}}>
            <input 
              type="text" 
              placeholder="🔍 Search users..." 
              value={query}
              onChange={handleSearch}
              className="glass"
              style={{padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: '#fff', width: '250px', outline: 'none'}}
            />
            {searchOpen && results.length > 0 && (
              <div className="glass" style={{position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '0.5rem', borderRadius: '12px', padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', maxHeight: '300px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'}}>
                {results.map(u => (
                  <div key={u._id} onClick={() => goToProfile(u._id)} style={{padding: '0.8rem 1rem', cursor: 'pointer', borderRadius: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s', ':hover': {background: 'rgba(255,255,255,0.1)'}}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
                      <div style={{width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold'}}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <span style={{fontWeight: 600}}>{u.username}</span>
                    </div>
                    <span style={{color: 'var(--text-muted)'}}>→</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
        {user && <Link to="/" style={{color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500}}>Home</Link>}
        {user && <Link to="/explore" style={{color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500}}>Explore</Link>}
        {user ? (
          <>
            <Link to="/wall" style={{color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500}}>My Wall</Link>
            <Link to={`/profile/${user._id}`} style={{color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500}}>Profile</Link>
            <button onClick={logout} className="btn btn-secondary" style={{padding: '0.4rem 1.2rem'}}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{color: 'var(--text-main)', textDecoration: 'none', fontWeight: 500}}>Login</Link>
            <Link to="/signup" className="btn" style={{padding: '0.4rem 1.2rem'}}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
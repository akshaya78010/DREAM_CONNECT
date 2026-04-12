import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';

// The Landing Page for logged out users
const LandingPage = () => (
    <div className="home-container" style={{display: 'flex', flexDirection: 'column', gap: '4rem', alignItems: 'center', textAlign: 'center', padding: '4rem 0'}}>
      <div className="hero section" style={{maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center'}}>
        <h1 style={{fontSize: '3.5rem', fontWeight: 800, background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2}}>
          Turn Your Wildest Dreams Into Reality.
        </h1>
        <p style={{fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '600px'}}>
          DreamConnect is a premium goal-tracking platform where you map out your milestones, connect with visionaries, and celebrate every achievement along the way.
        </p>
        <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
          <Link to="/login" className="btn" style={{padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', border: 'none', boxShadow: '0 10px 20px -5px rgba(236, 72, 153, 0.4)'}}>Login</Link>
          <Link to="/signup" className="btn btn-secondary" style={{padding: '1rem 2.5rem', fontSize: '1.1rem', borderRadius: '50px'}}>Sign Up</Link>
        </div>
      </div>

      <div className="features glass" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', width: '100%', padding: '3rem', marginTop: '3rem'}}>
        <div className="feature-card" style={{padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)'}}>
           <h3 style={{fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1rem'}}>📍 Track Milestones</h3>
           <p style={{color: 'var(--text-muted)'}}>Break down your large aspirations into bite-sized actionable milestones and track your journey.</p>
        </div>
        <div className="feature-card" style={{padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)'}}>
           <h3 style={{fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '1rem'}}>🌐 Global Community</h3>
           <p style={{color: 'var(--text-muted)'}}>Discover like-minded visionaries from around the globe. Follow their path.</p>
        </div>
        <div className="feature-card" style={{padding: '2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)'}}>
           <h3 style={{fontSize: '1.5rem', color: '#10b981', marginBottom: '1rem'}}>🧱 Personal Dream Wall</h3>
           <p style={{color: 'var(--text-muted)'}}>Your dedicated space to store public and private goals. Keep yourself accountable.</p>
        </div>
      </div>
      
      <div className="quote section" style={{marginTop: '4rem', padding: '3rem', maxWidth: '700px'}}>
        <blockquote style={{fontSize: '1.8rem', fontStyle: 'italic', fontWeight: 300, color: '#f8fafc', position: 'relative'}}>
          <span style={{position: 'absolute', top: '-30px', left: '-30px', fontSize: '5rem', color: 'var(--primary)', opacity: 0.2}}>“</span>
           The future belongs to those who believe in the beauty of their dreams.
          <footer style={{fontSize: '1rem', fontStyle: 'normal', color: 'var(--text-muted)', marginTop: '1.5rem', fontWeight: 500}}>- Eleanor Roosevelt</footer>
        </blockquote>
      </div>
    </div>
);

// The Dashboard Feed for logged in users
const FollowingFeed = () => {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeFeed();
  }, []);

  const fetchHomeFeed = async () => {
    try {
      const res = await axios.get('/api/dreams/home-feed', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDreams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const likePost = async (id) => {
      try {
        const res = await axios.put(`/api/dreams/${id}/like`, {}, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setDreams(dreams.map(d => d._id === id ? { ...d, likes: res.data } : d));
      } catch (err) {}
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '4rem'}}>Loading Your Feed...</div>;

  if (dreams.length === 0) {
      return (
          <div style={{textAlign: 'center', marginTop: '5rem', padding: '4rem 2rem', maxWidth: '600px', margin: '5rem auto 0'}} className="glass">
              <h2 style={{fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)'}}>Welcome to your Home Feed!</h2>
              <p style={{color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem'}}>
                  Right now, your feed is quiet because you aren't following anyone yet.
              </p>
              <p style={{color: 'var(--text-main)', fontSize: '1rem', marginBottom: '2rem'}}>
                  In this application, you can map out your milestones into Dreams, attach photos or videos of your progress, and mark them as Achieved. 
                  Start by exploring other users' goals and following them to fill up this feed with inspiration!
              </p>
              <Link to="/explore" className="btn" style={{padding: '0.8rem 2rem', fontSize: '1.1rem'}}>Explore Global Dreams →</Link>
          </div>
      )
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem', maxWidth: '600px', margin: '0 auto'}}>
      <div style={{display: 'flex', gap: '1rem', marginBottom: '0.5rem', justifyContent: 'center'}}>
        <Link to="/wall" className="btn" style={{padding: '0.8rem 2rem', borderRadius: '30px', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', border: 'none', color: '#fff', textDecoration: 'none'}}>Start Dreaming</Link>
        <Link to="/explore" className="btn btn-secondary" style={{padding: '0.8rem 2rem', borderRadius: '30px', textDecoration: 'none'}}>Explore Now</Link>
      </div>
      <h2 style={{borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem'}}>Your Following Feed</h2>
      {dreams.map(dream => (
        <div key={dream._id} className="glass" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: dream.isFulfilled ? '1px solid #10b981' : ''}}>
          {/* Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Link to={`/profile/${dream.user._id}`} style={{display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none', color: 'inherit'}}>
              <div style={{width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                {dream.user.username[0].toUpperCase()}
              </div>
              <span style={{fontWeight: 600, fontSize: '1.1rem'}}>{dream.user.username}</span>
            </Link>
            {dream.isFulfilled && <span style={{fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '12px'}}>🏆 Achieved</span>}
          </div>
          
          {/* Content */}
          <div style={{marginTop: '0.5rem'}}>
              <h3 style={{margin: '0 0 0.5rem 0', color: dream.isFulfilled ? '#10b981' : 'var(--text-main)', fontSize: '1.3rem'}}>{dream.title}</h3>
              <p style={{color: 'var(--text-muted)', fontSize: '1rem'}}>{dream.description}</p>
          </div>

          {/* Media with Autoplay attributes and object-fit for images */}
          {dream.media && dream.media.length > 0 ? (
            <div style={{display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem', marginTop: '1rem'}}>
              {dream.media.map((m, i) => {
                 const url = m.url.startsWith('http') ? m.url : `${API_BASE_URL}${m.url}`;
                 if (m.mType === 'video') return <video key={i} src={url} controls muted loop style={{height: '250px', borderRadius: '8px', backgroundColor: '#000'}} />;
                 if (m.mType === 'audio') return <audio key={i} src={url} controls style={{marginTop: '0.5rem'}} />;
                 return <img key={i} src={url} style={{height: '250px', borderRadius: '8px', objectFit: 'cover', backgroundColor: 'rgba(0,0,0,0.2)'}} alt="" />;
              })}
            </div>
          ) : (
            <>
              {dream.mediaType === 'video' && <video src={dream.mediaUrl?.startsWith('http') ? dream.mediaUrl : `${API_BASE_URL}${dream.mediaUrl}`} controls autoPlay muted loop style={{width: '100%', borderRadius: '8px', maxHeight: '500px', backgroundColor: '#000'}} />}
              {dream.mediaType === 'audio' && <audio src={dream.mediaUrl?.startsWith('http') ? dream.mediaUrl : `${API_BASE_URL}${dream.mediaUrl}`} controls style={{width: '100%', marginTop: '0.5rem'}} />}
              {dream.mediaType === 'image' && <img src={dream.mediaUrl?.startsWith('http') ? dream.mediaUrl : `${API_BASE_URL}${dream.mediaUrl}`} alt="Dream media" style={{width: '100%', borderRadius: '8px', maxHeight: '500px', objectFit: 'contain', backgroundColor: 'rgba(0,0,0,0.2)'}} />}
            </>
          )}

          {/* Minimal Interaction Bar */}
          <div style={{marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem', fontSize: '0.9rem', alignItems: 'center'}}>
              <button onClick={() => likePost(dream._id)} style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: dream.likes?.length > 0 ? '#ec4899' : 'var(--text-muted)'}}>
                  ❤️ {dream.likes?.length || 0}
              </button>
              <Link to="/explore" style={{background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', textDecoration: 'none'}}>
                  💬 {dream.comments?.length || 0} Comments
              </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function Home() {
  const { user } = useAuth();
  
  if (user) return <FollowingFeed />;
  return <LandingPage />;
}
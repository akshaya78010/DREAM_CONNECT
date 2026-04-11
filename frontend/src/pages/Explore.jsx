import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Explore() {
  const [dreams, setDreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'dreams', 'achievements'
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentSection, setActiveCommentSection] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    try {
      const res = await axios.get('/api/dreams');
      setDreams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (dreamId) => {
    if (!user) return alert('Please login to like posts');
    try {
      const res = await axios.put(`/api/dreams/${dreamId}/like`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDreams(dreams.map(d => d._id === dreamId ? { ...d, likes: res.data } : d));
    } catch (err) {
      console.error(err);
    }
  };

  const submitComment = async (dreamId) => {
    if (!user) return alert('Please login to comment');
    const text = commentInputs[dreamId];
    if (!text || text.trim() === '') return;

    try {
      const res = await axios.post(`/api/dreams/${dreamId}/comment`, { text }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Replace only comments for this dream
      setDreams(dreams.map(d => d._id === dreamId ? { ...d, comments: res.data } : d));
      setCommentInputs({ ...commentInputs, [dreamId]: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const renderedDreams = dreams.filter(d => {
    if (filter === 'dreams') return !d.isFulfilled;
    if (filter === 'achievements') return d.isFulfilled;
    return true;
  });

  if (loading) return <div style={{textAlign: 'center', marginTop: '4rem'}}>Loading global dreams...</div>;

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '4rem'}}>
      <div style={{textAlign: 'center', marginBottom: '1rem'}}>
        <h2>Explore The Community</h2>
        <p style={{color: 'var(--text-muted)'}}>Get inspired by what others are building towards</p>
      </div>

      {/* Filters */}
      <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem'}}>
        <button onClick={() => setFilter('all')} className={`btn ${filter !== 'all' ? 'btn-secondary' : ''}`}>All Posts</button>
        <button onClick={() => setFilter('dreams')} className={`btn ${filter !== 'dreams' ? 'btn-secondary' : ''}`}>Active Dreams</button>
        <button onClick={() => setFilter('achievements')} className={`btn ${filter !== 'achievements' ? 'btn-secondary' : ''}`}>Achievements</button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem'}}>
        {renderedDreams.map(dream => (
          <div key={dream._id} className="glass" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: dream.isFulfilled ? '1px solid #10b981' : ''}}>
            
            {/* Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
               <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
                <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                  {dream.user.username[0].toUpperCase()}
                </div>
                <span style={{fontWeight: 600}}>{dream.user.username}</span>
              </div>
              {dream.isFulfilled && <span style={{fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.2rem 0.6rem', borderRadius: '12px'}}>🏆 Achieved</span>}
            </div>
            
            <h3 style={{margin: '0.5rem 0 0 0', color: dream.isFulfilled ? '#10b981' : 'var(--primary)', fontSize: '1.4rem'}}>{dream.title}</h3>
            <p style={{color: 'var(--text-muted)', fontSize: '1rem'}}>{dream.description}</p>
            
            {/* Media Rendering */}
            {dream.media && dream.media.length > 0 ? (
              <div style={{display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem', marginTop: '1rem'}}>
                {dream.media.map((m, i) => {
                   const url = m.url.startsWith('http') ? m.url : `http://localhost:3000${m.url}`;
                   if (m.mType === 'video') return <video key={i} src={url} controls muted loop style={{height: '250px', borderRadius: '8px', backgroundColor: '#000'}} />;
                   if (m.mType === 'audio') return <audio key={i} src={url} controls style={{marginTop: '0.5rem'}} />;
                   return <img key={i} src={url} style={{height: '250px', borderRadius: '8px', objectFit: 'cover', backgroundColor: 'rgba(0,0,0,0.2)'}} alt="" />;
                })}
              </div>
            ) : (
              <>
                {dream.mediaType === 'video' && <video src={dream.mediaUrl?.startsWith('http') ? dream.mediaUrl : `http://localhost:3000${dream.mediaUrl}`} controls autoPlay muted loop style={{width: '100%', borderRadius: '8px', marginTop: '0.5rem', maxHeight: '500px', backgroundColor: '#000'}} />}
                {dream.mediaType === 'audio' && <audio src={dream.mediaUrl?.startsWith('http') ? dream.mediaUrl : `http://localhost:3000${dream.mediaUrl}`} controls style={{width: '100%', marginTop: '0.5rem'}} />}
                {dream.mediaType === 'image' && <img src={dream.mediaUrl?.startsWith('http') ? dream.mediaUrl : `http://localhost:3000${dream.mediaUrl}`} alt="Dream media" style={{width: '100%', borderRadius: '8px', marginTop: '0.5rem', maxHeight: '500px', objectFit: 'contain', backgroundColor: 'rgba(0,0,0,0.2)'}} />}
              </>
            )}

            {/* Interaction Bar */}
            <div style={{marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '1.5rem', fontSize: '0.9rem', alignItems: 'center'}}>
              <span onClick={() => handleLike(dream._id)} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: dream.likes?.includes(user?._id) ? '#ec4899' : 'var(--text-muted)'}}>
                {dream.likes?.includes(user?._id) ? '❤️' : '🤍'} {dream.likes?.length || 0}
              </span>
              <span onClick={() => setActiveCommentSection(activeCommentSection === dream._id ? null : dream._id)} style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)'}}>
                💬 {dream.comments?.length || 0}
              </span>
            </div>

            {/* Expandable Comment Section */}
            {activeCommentSection === dream._id && (
              <div style={{marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px'}}>
                <div style={{maxHeight: '150px', overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem'}}>
                  {dream.comments.map((c, i) => (
                    <div key={i} style={{fontSize: '0.9rem'}}>
                      <strong style={{color: 'var(--primary)'}}>{c.user.username || 'User'}: </strong>
                      <span style={{color: 'var(--text-main)'}}>{c.text}</span>
                    </div>
                  ))}
                  {dream.comments.length === 0 && <span style={{fontSize:'0.9rem', color: 'var(--text-muted)'}}>No comments yet. Be the first!</span>}
                </div>
                {user && (
                   <div style={{display: 'flex', gap: '0.5rem'}}>
                    <input 
                      type="text" 
                      placeholder="Write a comment..." 
                      style={{padding: '0.5rem', fontSize: '0.9rem'}}
                      value={commentInputs[dream._id] || ''}
                      onChange={e => setCommentInputs({...commentInputs, [dream._id]: e.target.value})}
                    />
                    <button className="btn" style={{padding: '0.5rem 1rem'}} onClick={() => submitComment(dream._id)}>Send</button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {renderedDreams.length === 0 && <p style={{textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem'}}>No posts found for this filter.</p>}
    </div>
  );
}
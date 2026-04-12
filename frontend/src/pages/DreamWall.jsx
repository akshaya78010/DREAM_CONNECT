import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export default function DreamWall() {
  const [dreams, setDreams] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [file, setFile] = useState([]);
  
  const { user } = useAuth();

  useEffect(() => {
    fetchDreams();
  }, []);

  const fetchDreams = async () => {
    try {
      const res = await axios.get('/api/dreams/my-wall', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDreams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createDream = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('isPrivate', isPrivate);
    if (file && file.length > 0) {
      file.forEach(f => formData.append('media', f));
    }

    try {
      await axios.post('/api/dreams', formData, { 
        headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}`
        } 
      });
      setIsOpen(false);
      setTitle(''); setDescription(''); setIsPrivate(false); setFile([]);
      fetchDreams();
    } catch (err) {
      console.error(err);
    }
  };

  const markFulfilled = async (id) => {
    if (!window.confirm("Are you sure you want to mark this dream as successfully achieved?")) return;
    try {
      await axios.put(`/api/dreams/${id}/fulfill`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      fetchDreams();
    } catch (err) {
      console.error(err);
    }
  };

  const totalDreams = dreams.length;
  const achievedDreams = dreams.filter(d => d.isFulfilled).length;
  const activeDreams = totalDreams - achievedDreams;
  const progressPercent = totalDreams === 0 ? 0 : Math.round((achievedDreams / totalDreams) * 100);

  return (
    <div style={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '2rem', paddingBottom: '4rem', alignItems: 'start'}}>
      
      {/* Main Wall Content */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>My Dream Wall</h2>
          <button className="btn" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? 'Cancel' : '+ Add Dream'}
          </button>
        </div>

        {isOpen && (
          <form onSubmit={createDream} className="glass" style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <h3>Post a New Dream</h3>
            <input placeholder="What is your dream?" value={title} onChange={e => setTitle(e.target.value)} required />
            <textarea placeholder="Describe it in detail..." rows="4" value={description} onChange={e => setDescription(e.target.value)} required />
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
              <label style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Attach Media (Audio / Video / Image)</label>
              <input type="file" multiple accept="audio/*,video/*,image/*" onChange={e => setFile(Array.from(e.target.files))} style={{background: 'transparent', border: '1px dashed var(--border)', padding: '1rem'}} />
            </div>

            <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.5rem'}}>
              <input type="checkbox" style={{width: 'auto'}} checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} />
              Keep this dream private
            </label>
            <button type="submit" className="btn" style={{alignSelf: 'flex-start'}}>Post Dream</button>
          </form>
        )}

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem'}}>
          {dreams.map(dream => (
            <div key={dream._id} className="glass" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: dream.isFulfilled ? '1px solid #10b981' : ''}}>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <h3 style={{margin: 0, color: dream.isFulfilled ? '#10b981' : 'var(--primary)', fontSize: '1.3rem'}}>{dream.title}</h3>
                {dream.isPrivate && <span style={{fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px'}}>Private</span>}
              </div>
              {dream.isFulfilled && <span style={{fontSize: '0.8rem', color: '#10b981', fontWeight: 600}}>🏆 Achieved</span>}
              
              <p style={{color: 'var(--text-muted)'}}>{dream.description}</p>
              
              {dream.media && dream.media.length > 0 ? (
                <div style={{display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem'}}>
                  {dream.media.map((m, i) => {
                     const url = m.url.startsWith('http') ? m.url : `${API_BASE_URL}${m.url}`;
                     if (m.mType === 'video') return <video key={i} src={url} controls muted loop style={{height: '250px', borderRadius: '8px', backgroundColor: '#000'}} />;
                     if (m.mType === 'audio') return <audio key={i} src={url} controls style={{marginTop: '0.5rem'}} />;
                     return <img key={i} src={url} style={{height: '250px', borderRadius: '8px', objectFit: 'cover', backgroundColor: 'rgba(0,0,0,0.2)'}} alt="" />;
                  })}
                </div>
              ) : (
                <>
                  {dream.mediaType === 'video' && <video src={dream.mediaUrl.startsWith('http') ? dream.mediaUrl : `${API_BASE_URL}${dream.mediaUrl}`} controls autoPlay muted loop style={{width: '100%', borderRadius: '8px', maxHeight: '500px', backgroundColor: '#000'}} />}
                  {dream.mediaType === 'audio' && <audio src={dream.mediaUrl.startsWith('http') ? dream.mediaUrl : `${API_BASE_URL}${dream.mediaUrl}`} controls style={{width: '100%'}} />}
                  {dream.mediaType === 'image' && <img src={dream.mediaUrl.startsWith('http') ? dream.mediaUrl : `${API_BASE_URL}${dream.mediaUrl}`} alt="Dream media" style={{width: '100%', borderRadius: '8px', maxHeight: '500px', objectFit: 'contain', backgroundColor: 'rgba(0,0,0,0.2)'}} />}
                </>
              )}

              <div style={{marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)'}}>
                <span style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>{new Date(dream.createdAt).toLocaleDateString()}</span>
                {!dream.isFulfilled && (
                  <button onClick={() => markFulfilled(dream._id)} className="btn btn-secondary" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderColor: '#10b981', color: '#10b981'}}>
                    Mark as Achieved
                  </button>
                )}
              </div>
            </div>
          ))}
          {dreams.length === 0 && !isOpen && (
            <p style={{color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem'}}>
              Your wall is currently empty. Start by adding your first dream!
            </p>
          )}
        </div>
      </div>

      {/* Progress Sidebar */}
      <div className="glass" style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem'}}>
        <h3 style={{margin: 0, textAlign: 'center', fontSize: '1.2rem'}}>Journey Progress</h3>
        
        {/* Circle Progress Bar */}
        <div style={{position: 'relative', width: '150px', height: '150px', margin: '0 auto'}}>
           <svg width="150" height="150" viewBox="0 0 150 150">
             <circle cx="75" cy="75" r="65" fill="none" stroke="var(--border)" strokeWidth="12" />
             <circle cx="75" cy="75" r="65" fill="none" stroke="#10b981" strokeWidth="12" 
                     strokeDasharray="408" strokeDashoffset={408 - (408 * progressPercent) / 100} 
                     strokeLinecap="round" transform="rotate(-90 75 75)" style={{transition: 'stroke-dashoffset 1s ease-in-out'}}/>
           </svg>
           <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
             <span style={{fontSize: '2rem', fontWeight: 'bold'}}>{progressPercent}%</span>
           </div>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem'}}>
           <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)'}}>
             <span style={{color: 'var(--text-muted)'}}>Total Dreams</span>
             <span style={{fontWeight: 'bold'}}>{totalDreams}</span>
           </div>
           <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)'}}>
             <span style={{color: 'var(--text-muted)'}}>In Progress</span>
             <span style={{fontWeight: 'bold', color: 'var(--primary)'}}>{activeDreams}</span>
           </div>
           <div style={{display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)'}}>
             <span style={{color: 'var(--text-muted)'}}>Achieved</span>
             <span style={{fontWeight: 'bold', color: '#10b981'}}>{achievedDreams}</span>
           </div>
        </div>
      </div>

    </div>
  );
}
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const { id } = useParams();
  
  const isMyProfile = user && user._id === id;
  
  const [profile, setProfile] = useState(null);
  const [dreams, setDreams] = useState([]);
  const [activeTab, setActiveTab] = useState('dreams'); // 'dreams', 'achievements', 'requests'

  // Follow states
  const [isFollowing, setIsFollowing] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  // Modal logic
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'followers', 'following'
  const [modalData, setModalData] = useState([]);

  useEffect(() => {
    setActiveTab('dreams');
    fetchData();
  }, [id, user]);

  const fetchData = async () => {
    try {
      // If it's your own profile
      if (isMyProfile) {
        const [profileRes, dreamsRes] = await Promise.all([
          axios.get('/api/users/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
          axios.get('/api/dreams/my-wall', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
        ]);
        setProfile(profileRes.data);
        setDreams(dreamsRes.data);
      } else {
        // Someone else's profile
        const profileRes = await axios.get(`/api/users/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setProfile(profileRes.data);
        
        const iFollow = profileRes.data.followers.some(f => f._id === user?._id);
        setIsFollowing(iFollow);
        // Note: checking isRequested might require returning followRequests from backend or just managing state optimistically.
        // For simplicity we will handle it optimistically.

        if (!profileRes.data.isPrivate || iFollow) {
          // fetch their dreams (we need a route for this, or use public dreams route filtered)
          // Actually, `/api/dreams` returns public dreams.
          const exploreRes = await axios.get('/api/dreams');
          const theirDreams = exploreRes.data.filter(d => d.user._id === id);
          setDreams(theirDreams);
        } else {
          setDreams([]); // Hidden
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowToggle = async () => {
    try {
      await axios.put(`/api/users/${id}/follow`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setIsFollowing(!isFollowing);
      fetchData(); // refresh counts
    } catch (err) {}
  };

  const handleAcceptRequest = async (reqId) => {
    try {
      await axios.put(`/api/users/${reqId}/accept`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchData();
    } catch (err) {}
  };

  const handleRejectRequest = async (reqId) => {
    try {
      await axios.put(`/api/users/${reqId}/reject`, {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchData();
    } catch (err) {}
  };

  const handlePrivacyToggle = async () => {
    try {
      const res = await axios.put('http://localhost:3000/api/users/toggle-privacy', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setProfile({ ...profile, isPrivate: res.data.isPrivate });
    } catch (err) {
      console.error('Privacy toggle error:', err);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setModalData(type === 'followers' ? profile.followers : profile.following);
    setModalOpen(true);
  };

  if (!profile) return <div style={{textAlign: 'center', marginTop: '4rem'}}>Loading profile...</div>;

  const activeDreams = dreams.filter(d => !d.isFulfilled);
  const achievements = dreams.filter(d => d.isFulfilled);
  let displayedPosts = activeTab === 'dreams' ? activeDreams : achievements;
  if (activeTab === 'requests') displayedPosts = profile.followRequests || [];

  return (
    <div style={{maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      
      {/* Profile Header */}
      <div className="glass" style={{padding: '3rem 2rem', display: 'flex', gap: '2rem', alignItems: 'center', position: 'relative'}}>
        
        {isMyProfile && (
           <button onClick={handlePrivacyToggle} className={`btn ${profile.isPrivate ? 'btn-secondary' : ''}`} style={{position: 'absolute', top: '1rem', right: '1rem'}}>
               {profile.isPrivate ? '🔒 Switch to Public' : '🌎 Switch to Private'}
           </button>
        )}

        <div style={{width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold'}}>
          {profile.username[0].toUpperCase()}
        </div>
        
        <div style={{flex: 1}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem'}}>
            <h1 style={{margin: 0, color: 'var(--text-main)', fontSize: '2.5rem'}}>{profile.username}</h1>
            {!isMyProfile && user && (
              <button onClick={handleFollowToggle} className={`btn ${isFollowing ? 'btn-secondary' : ''}`} style={{padding: '0.4rem 1rem', fontSize: '0.9rem'}}>
                {isFollowing ? 'Following' : isRequested ? 'Requested' : 'Follow'}
              </button>
            )}
          </div>
          <p style={{color: 'var(--text-muted)', marginBottom: '1.5rem'}}>{profile.email}</p>
          
          <div style={{display: 'flex', gap: '2rem', fontSize: '1.1rem'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <span style={{fontWeight: 700, color: 'var(--primary)'}}>{activeDreams.length}</span>
              <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Active Dreams</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <span style={{fontWeight: 700, color: '#10b981'}}>{achievements.length}</span>
              <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Achievements</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px', transition: 'background 0.2s', background: 'rgba(255,255,255,0.02)'}} onClick={() => openModal('followers')} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
              <span style={{fontWeight: 700}}>{profile.followers?.length || 0}</span>
              <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Followers</span>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: '8px', transition: 'background 0.2s', background: 'rgba(255,255,255,0.02)'}} onClick={() => openModal('following')} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
              <span style={{fontWeight: 700}}>{profile.following?.length || 0}</span>
              <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Following</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem'}}>
        <button onClick={() => setActiveTab('dreams')} style={{background: 'none', border: 'none', color: activeTab === 'dreams' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600, cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: activeTab === 'dreams' ? '2px solid var(--primary)' : 'none'}}>
          Dreams
        </button>
        <button onClick={() => setActiveTab('achievements')} style={{background: 'none', border: 'none', color: activeTab === 'achievements' ? '#10b981' : 'var(--text-muted)', fontSize: '1.2rem', fontWeight: 600, cursor: 'pointer', paddingBottom: '0.5rem', borderBottom: activeTab === 'achievements' ? '2px solid #10b981' : 'none'}}>
          Achievements
        </button>
      </div>

      {/* Posts / Requests Grid */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        {!isMyProfile && profile.isPrivate && !isFollowing ? (
          <div className="glass" style={{textAlign: 'center', padding: '4rem 2rem'}}>
             <h2>This Account is Private</h2>
             <p style={{color: 'var(--text-muted)'}}>Follow to see their photos and videos.</p>
          </div>
        ) : (
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem'}}>
            {displayedPosts.length === 0 ? (
              <p style={{color: 'var(--text-muted)', padding: '2rem 0'}}>No {activeTab} yet.</p>
            ) : (
              displayedPosts.map(dream => (
                  <div key={dream._id} className="glass" style={{padding: '1.5rem', border: dream.isFulfilled ? '1px solid #10b981' : ''}}>
                    <h3 style={{color: dream.isFulfilled ? '#10b981' : 'var(--text-main)', marginBottom: '0.5rem'}}>{dream.title}</h3>
                    <p style={{color: 'var(--text-muted)'}}>{dream.description}</p>
                    {dream.media && dream.media.length > 0 ? (
                      <div style={{display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem', marginTop: '1rem'}}>
                        {dream.media.map((m, i) => {
                           const url = m.url.startsWith('http') ? m.url : `http://localhost:3000${m.url}`;
                           if (m.mType === 'video') return <video key={i} src={url} controls muted loop style={{height: '200px', borderRadius: '8px', backgroundColor: '#000'}} />;
                           if (m.mType === 'audio') return <audio key={i} src={url} controls style={{marginTop: '0.5rem'}} />;
                           return <img key={i} src={url} style={{height: '200px', borderRadius: '8px', objectFit: 'cover', backgroundColor: 'rgba(0,0,0,0.2)'}} alt="" />;
                        })}
                      </div>
                    ) : (
                      <>
                        {dream.mediaType === 'video' && <video src={dream.mediaUrl?.startsWith('http') ? dream.mediaUrl : `http://localhost:3000${dream.mediaUrl}`} controls autoPlay muted loop style={{width: '100%', borderRadius: '8px', marginTop: '1rem', maxHeight: '300px', backgroundColor: '#000'}} />}
                        {dream.mediaType === 'audio' && <audio src={dream.mediaUrl?.startsWith('http') ? dream.mediaUrl : `http://localhost:3000${dream.mediaUrl}`} controls style={{width: '100%', marginTop: '1rem'}} />}
                        {dream.mediaType === 'image' && <img src={dream.mediaUrl?.startsWith('http') ? dream.mediaUrl : `http://localhost:3000${dream.mediaUrl}`} style={{width: '100%', borderRadius: '8px', marginTop: '1rem', maxHeight: '300px', objectFit: 'contain', backgroundColor: 'rgba(0,0,0,0.2)'}} alt="" />}
                      </>
                    )}
                  </div>
                ))
              )
            }
          </div>
        )}
      </div>

      {modalOpen && (
         <div style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
            <div className="glass" style={{width: '90%', maxWidth: '400px', padding: '2rem', maxHeight: '80vh', display: 'flex', flexDirection: 'column'}}>
               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                  <h3 style={{margin: 0, textTransform: 'capitalize'}}>{modalType}</h3>
                  <button onClick={() => setModalOpen(false)} style={{background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer'}}>&times;</button>
               </div>
               <div style={{overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
                  {modalData.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No users found.</p> :
                   modalData.map(u => (
                     <Link to={`/profile/${u._id}`} onClick={() => setModalOpen(false)} key={u._id} style={{padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit', transition: 'background 0.2s'}} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem'}}>
                          <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(45deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold'}}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <span style={{fontWeight: 600}}>{u.username}</span>
                        </div>
                        <span style={{color: 'var(--text-muted)'}}>→</span>
                     </Link>
                   ))
                  }
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
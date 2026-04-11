import { useState } from 'react';
import axios from 'axios';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const res = await axios.post('/api/contact', { name, email, message });
      setStatus(res.data.message || 'Sent successfully!');
      setName(''); setEmail(''); setMessage('');
    } catch (err) {
      setStatus('Failed to send message. Please try again.');
    }
  };

  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: '3rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem'}}>
      <div className="glass" style={{padding: '3rem', textAlign: 'center'}}>
        <h1 style={{fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem'}}>About DreamConnect</h1>
        <p style={{color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.8', maxWidth: '600px', margin: '0 auto'}}>
          DreamConnect was born from a simple idea: <strong>Goals are achieved faster when we aren't alone.</strong><br/><br/>
          Whether you want to climb Mount Everest, start a tech company, or just become a better version of yourself,
          this platform serves as your personal canvas. Visually map out your progress, connect with a global community of 
          doers, and transform your distant dreams into documented achievements.
        </p>
      </div>

      <div className="glass" style={{padding: '3rem'}}>
        <h2 style={{textAlign: 'center', marginBottom: '2rem'}}>Get in Touch</h2>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px', margin: '0 auto'}}>
          <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} required />
          <input type="email" placeholder="Your Email address" value={email} onChange={e => setEmail(e.target.value)} required />
          <textarea placeholder="How can we help?" rows="5" value={message} onChange={e => setMessage(e.target.value)} required />
          <button type="submit" className="btn" style={{width: '100%', marginTop: '0.5rem'}} disabled={status === 'Sending...'}>
            {status === 'Sending...' ? 'Sending...' : 'Send Message'}
          </button>
          {status && status !== 'Sending...' && (
            <p style={{textAlign: 'center', color: status.includes('Failed') ? '#ff4d4f' : '#10b981', marginTop: '1rem'}}>{status}</p>
          )}
        </form>
      </div>
    </div>
  );
}
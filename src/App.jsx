import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import VideoCall from './components/VideoCall';
import ProfileScreen from './components/ProfileScreen';
import NotificationsScreen from './components/NotificationsScreen';
import ContactsScreen from './components/ContactsScreen';

// =============================================
// ICONS (Material Symbols via span)
// =============================================
const Icon = ({ name, fill = 0, size = 24, className = '' }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}` }}
  >
    {name}
  </span>
);

// =============================================
// HELPER: Initials Avatar URL
// =============================================
const getInitialsUrl = (name) => {
  const n = name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=004ac6&color=fff&bold=true`;
};

// =============================================
// HELPER: Format time
// =============================================
const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

// =============================================
// SCREEN 1: SPLASH SCREEN
// =============================================
const SplashScreen = ({ onDone }) => {
  const barRef = useRef(null);

  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (barRef.current) barRef.current.style.width = '100%';
        setTimeout(onDone, 600);
        return;
      }
      if (barRef.current) barRef.current.style.width = `${progress}%`;
    }, 280);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <main className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-surface">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary-container/20 rounded-full blur-[120px] glow-bg" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary-container/10 rounded-full blur-[100px] glow-bg" style={{ animationDelay: '-6s' }} />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="glass-panel p-8 rounded-full mb-6 shadow-2xl flex items-center justify-center float-animation">
          <div className="w-24 h-24 bg-primary rounded-[28%] flex items-center justify-center shadow-lg transform rotate-12 hover:rotate-0 transition-transform duration-700">
            <Icon name="hub" fill={1} size={48} className="text-white" />
          </div>
        </div>
        <div className="text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-on-background">Nexus</h1>
          <p className="mt-2 text-xs font-medium text-outline tracking-widest uppercase" style={{ fontFamily: 'Geist, sans-serif' }}>
            Secure Intelligence
          </p>
        </div>
      </div>

      {/* Loading bar */}
      <div className="absolute bottom-16 w-64 flex flex-col items-center gap-4">
        <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
          <div ref={barRef} className="loading-bar h-full bg-primary-container rounded-full" style={{ boxShadow: '0 0 12px rgba(37,99,235,0.4)' }} />
        </div>
        <div className="flex items-center gap-2">
          <Icon name="progress_activity" size={18} className="text-primary animate-spin" />
          <span className="text-xs italic text-outline-variant">Establishing secure channel...</span>
        </div>
      </div>
    </main>
  );
};

// =============================================
// SCREEN 2: LOGIN / SIGNUP
// =============================================
const AuthScreen = ({ onDemoLogin, onEmailAuth, onGoogleLogin, authError, authLoading, authMode, setAuthMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onEmailAuth(e, email, password, fullName);
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-surface">
      {/* Background blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full glow-bg" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-secondary/10 blur-[100px] rounded-full glow-bg" style={{ animationDelay: '-6s' }} />
      <div className="absolute inset-0 bg-dot-pattern opacity-50" />

      <main className="relative z-10 w-full max-w-[480px] animate-fade-in-up">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mb-4 float-animation shadow-lg" style={{ boxShadow: '0 8px 32px rgba(0,74,198,0.25)' }}>
            <Icon name="shield_person" fill={1} size={32} className="text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-background">Welcome Back</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Please enter your details to access your secure messages.</p>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Tabs */}
          <div className="flex p-1 mb-6 rounded-xl bg-surface-container">
            {['login', 'signup'].map(mode => (
              <button
                key={mode}
                onClick={() => setAuthMode(mode)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${authMode === mode ? 'bg-primary text-white shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {mode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            ))}
          </div>

          {authError && (
            <div className={`p-3 mb-4 text-xs rounded-xl text-center border ${authError.toLowerCase().includes('success') ? 'bg-tertiary-container/20 text-tertiary border-tertiary/20' : 'bg-error-container/30 text-error border-error/20'}`}>
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-on-surface ml-1">Full Name</label>
                <div className="glass-input flex items-center px-4 py-3.5 rounded-xl">
                  <Icon name="person" size={20} className="text-outline" />
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 w-full text-sm text-on-surface placeholder:text-outline-variant ml-3 outline-none"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-on-surface ml-1">Email Address</label>
              <div className="glass-input flex items-center px-4 py-3.5 rounded-xl">
                <Icon name="mail" size={20} className="text-outline" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-transparent border-none focus:ring-0 w-full text-sm text-on-surface placeholder:text-outline-variant ml-3 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-medium text-on-surface">Password</label>
                {authMode === 'login' && <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>}
              </div>
              <div className="glass-input flex items-center px-4 py-3.5 rounded-xl">
                <Icon name="lock" size={20} className="text-outline" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="bg-transparent border-none focus:ring-0 w-full text-sm text-on-surface placeholder:text-outline-variant ml-3 outline-none flex-1"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-outline hover:text-on-surface-variant transition-colors">
                  <Icon name={showPass ? 'visibility_off' : 'visibility'} size={20} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-primary text-white font-semibold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
              style={{ boxShadow: '0 8px 24px rgba(0,74,198,0.3)' }}
            >
              {authLoading ? <Icon name="progress_activity" size={20} className="animate-spin" /> : authMode === 'login' ? 'Login' : 'Sign Up'}
              {!authLoading && <Icon name="arrow_forward" size={20} />}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center my-5">
            <div className="flex-grow border-t border-outline-variant/30" />
            <span className="mx-4 text-xs text-outline tracking-widest uppercase">or login with</span>
            <div className="flex-grow border-t border-outline-variant/30" />
          </div>

          {/* Social row */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onGoogleLogin}
              className="glass-input flex items-center justify-center gap-2 p-3.5 rounded-xl hover:bg-surface-variant/50 transition-all group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28-0.96,2.37-2.05,3.1v2.58h3.32c1.94,-1.78 3.05,-4.41 3.05,-7.48Z" fill="#4285F4" />
                <path d="M12,21c2.43,0 4.47,-0.81 5.96,-2.2l-3.32,-2.58c-0.92,0.62-2.1,0.98-3.64,0.98-2.34,0-4.32,-1.58-5.03,-3.7H2.52v2.68C4,18.89 7.74,21 12,21Z" fill="#34A853" />
                <path d="M6.97,13.5c-0.18,-0.54-0.28,-1.11-0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.42H2.52c-0.61,1.21-0.96,2.58-0.96,4.08 0,1.5 0.35,2.87 0.96,4.08L6.97,13.5Z" fill="#FBBC05" />
                <path d="M12,5.78c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.09 14.42,2.5 12,2.5 7.74,2.5 4,4.61 2.52,7.42l4.45,3.48c0.71,-2.12 2.69,-3.6 5.03,-3.6Z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-medium text-on-surface">Google</span>
            </button>
            <button
              onClick={onDemoLogin}
              className="flex items-center justify-center gap-2 p-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #004ac6 100%)', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
            >
              <span>🚀</span>
              <span>Try Demo</span>
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-sm text-on-surface-variant">
          {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-primary font-bold hover:underline">
            {authMode === 'login' ? 'Sign up for free' : 'Login'}
          </button>
        </p>
      </main>
    </div>
  );
};

// =============================================
// SCREEN 3: INCOMING CALL
// =============================================
const IncomingCallScreen = ({ caller, onAccept, onDecline }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden">
    {/* Blurred background */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-on-background/40 z-10" />
      <div
        className="w-full h-full bg-cover bg-center scale-110 blur-3xl opacity-60"
        style={{ backgroundImage: `url(${caller?.avatar_url || getInitialsUrl(caller?.full_name)})` }}
      />
    </div>

    <main className="relative z-20 flex flex-col items-center justify-between h-full w-full py-24 px-6">
      {/* Identity */}
      <div className="flex flex-col items-center text-center space-y-6 animate-fade-in-up">
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-primary/20 pulse-ring" />
          <div className="absolute -inset-8 rounded-full bg-primary/10 pulse-ring" style={{ animationDelay: '1s' }} />
          <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl">
            <img src={caller?.avatar_url || getInitialsUrl(caller?.full_name)} alt={caller?.full_name} className="w-full h-full object-cover" />
          </div>
          <div className="absolute bottom-2 right-2 w-8 h-8 bg-tertiary-fixed-dim border-4 border-white/20 rounded-full shadow-lg" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
            {caller?.full_name || caller?.email?.split('@')[0] || 'Unknown Caller'}
          </h1>
          <div className="flex items-center justify-center gap-2 text-primary-fixed-dim">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed-dim opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-fixed-dim" />
            </span>
            <span className="text-xs font-medium tracking-widest uppercase">Incoming Call...</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-around items-center w-full max-w-xs mb-8 animate-slide-in-bottom">
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onDecline}
            className="w-20 h-20 bg-error flex items-center justify-center rounded-full shadow-xl active:scale-95 transition-all"
            style={{ boxShadow: '0 8px 32px rgba(186,26,26,0.35)' }}
          >
            <Icon name="call_end" fill={1} size={36} className="text-white" />
          </button>
          <span className="text-sm font-semibold text-white/80">Decline</span>
        </div>
        <div className="flex flex-col items-center gap-4">
          <button
            onClick={onAccept}
            className="w-20 h-20 bg-tertiary flex items-center justify-center rounded-full shadow-xl active:scale-95 transition-all"
            style={{ boxShadow: '0 8px 32px rgba(0,98,66,0.35)' }}
          >
            <Icon name="call" fill={1} size={36} className="text-white" />
          </button>
          <span className="text-sm font-semibold text-white/80">Accept</span>
        </div>
      </div>
    </main>
  </div>
);

// =============================================
// SCREEN 4: VOICE CALL SCREEN
// =============================================
const VoiceCallScreen = ({ friend, onEnd, onSwitchToVideo }) => {
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatDuration = (s) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-between py-12 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110 blur-3xl opacity-60"
          style={{ backgroundImage: `url(${friend?.avatar_url || getInitialsUrl(friend?.full_name)})` }}
        />
        <div className="absolute inset-0 bg-on-background/50" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, transparent 0%, rgba(11,28,48,0.5) 100%)' }} />
      </div>

      {/* Top bar */}
      <header className="relative z-10 w-full flex justify-between items-center">
        <button className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all">
          <Icon name="expand_more" size={24} className="text-white" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-pulse" />
          <span className="text-xs font-medium text-white/80 tracking-widest uppercase">End-to-End Encrypted</span>
        </div>
        <button className="p-2 rounded-full hover:bg-white/10 active:scale-90 transition-all">
          <Icon name="person_add" size={24} className="text-white" />
        </button>
      </header>

      {/* Center identity */}
      <section className="relative z-10 flex flex-col items-center text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 rounded-full bg-primary-container/20 pulse-ring" />
          <div className="absolute inset-0 rounded-full bg-primary-container/10 pulse-ring" style={{ animationDelay: '1s' }} />
          <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl">
            <img src={friend?.avatar_url || getInitialsUrl(friend?.full_name)} alt={friend?.full_name} className="w-full h-full object-cover" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
          {friend?.full_name || friend?.email?.split('@')[0]}
        </h1>
        <span className="text-xl text-white/90 font-mono tracking-wider">{formatDuration(seconds)}</span>
        <span className="text-xs text-primary-fixed-dim uppercase tracking-widest mt-1 opacity-80">Active Call</span>
      </section>

      {/* Controls */}
      <section className="relative z-10 w-full max-w-md pb-4">
        <div className="glass-dark rounded-[40px] p-6 grid grid-cols-4 gap-4 items-center justify-items-center">
          {[
            { icon: muted ? 'mic_off' : 'mic', label: 'Mute', active: muted, onClick: () => setMuted(m => !m) },
            { icon: 'apps', label: 'Keypad', active: false, onClick: () => {} },
            { icon: speaker ? 'volume_up' : 'volume_down', label: 'Speaker', active: speaker, onClick: () => setSpeaker(s => !s) },
            { icon: 'videocam', label: 'Video', active: false, onClick: onSwitchToVideo },
          ].map(({ icon, label, active, onClick }) => (
            <button key={label} onClick={onClick} className="group flex flex-col items-center gap-2">
              <div className={`w-14 h-14 md:w-16 md:h-16 flex items-center justify-center rounded-full transition-all duration-200 ${active ? 'bg-white text-on-background' : 'bg-white/10 hover:bg-white/20 text-white'}`}>
                <Icon name={icon} size={24} className={active ? 'text-on-background' : 'text-white'} />
              </div>
              <span className={`text-xs ${active ? 'text-white' : 'text-white/70'}`}>{label}</span>
            </button>
          ))}

          <div className="col-span-4 w-full mt-2">
            <button
              onClick={onEnd}
              className="w-full h-14 rounded-full bg-error flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
              style={{ boxShadow: '0 8px 24px rgba(186,26,26,0.35)' }}
            >
              <Icon name="call_end" fill={1} size={24} className="text-white" />
              <span className="text-sm font-semibold text-white uppercase tracking-wider">End Call</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// =============================================
// SCREEN 5: MESSAGES / HOME DASHBOARD
// =============================================
const HomeScreen = ({
  myProfile,
  friends,
  activeFriend,
  setActiveFriend,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  onLogout,
  onAddFriend,
  searchCode,
  setSearchCode,
  searchError,
  searchSuccess,
  searchLoading,
  showProfileModal,
  setShowProfileModal,
  editName,
  setEditName,
  onUpdateProfile,
  onAvatarUpload,
  uploadingAvatar,
  demoMode,
  onStartVideoCall,
  onStartVoiceCall,
  incomingCallOffer,
  onAcceptCall,
  onDeclineCall,
  isVideoCallActive,
  isCaller,
  onEndVideoCall,
  onVoiceCallActive,
  setOnVoiceCallActive,
  activeTab,
  setActiveTab,
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // If voice call is active, show voice call screen
  if (onVoiceCallActive && activeFriend) {
    return (
      <VoiceCallScreen
        friend={activeFriend}
        onEnd={() => setOnVoiceCallActive(false)}
        onSwitchToVideo={() => {
          setOnVoiceCallActive(false);
          onStartVideoCall();
        }}
      />
    );
  }

  // Full Screen views based on activeTab
  if (activeTab === 'profile') {
    return (
      <ProfileScreen
        myProfile={myProfile}
        onBack={() => setActiveTab('chats')}
        onAvatarUpload={onAvatarUpload}
        uploadingAvatar={uploadingAvatar}
        onEditProfile={() => {}}
      />
    );
  }

  if (activeTab === 'notifications') {
    return (
      <NotificationsScreen onBack={() => setActiveTab('chats')} />
    );
  }

  if (activeTab === 'contacts') {
    return (
      <ContactsScreen
        friends={friends}
        myProfile={myProfile}
        onSelectFriend={(f) => {
          setActiveFriend(f);
          setActiveTab('chats');
        }}
        onAddFriend={onAddFriend}
        searchCode={searchCode}
        setSearchCode={setSearchCode}
        searchLoading={searchLoading}
        searchError={searchError}
        searchSuccess={searchSuccess}
        onBack={() => setActiveTab('chats')}
      />
    );
  }

  // Incoming call overlay
  const incomingCaller = incomingCallOffer
    ? friends.find(f => f.id === incomingCallOffer.caller_id)
    : null;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-inter">
      {/* Atmospheric blobs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[150px] pointer-events-none glow-bg" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none glow-bg" style={{ animationDelay: '-8s' }} />

      {/* ── SIDEBAR ── */}
      <aside className={`${activeFriend ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] flex-shrink-0 flex-col border-r border-outline-variant/20 bg-surface/80 backdrop-blur-xl relative z-10`}>
        {/* Top App Bar */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-outline-variant/20 bg-surface/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('profile')}
              className="relative w-10 h-10 rounded-full overflow-hidden border border-outline-variant hover:ring-2 hover:ring-primary/30 transition-all"
            >
              <img src={myProfile?.avatar_url || getInitialsUrl(myProfile?.full_name || myProfile?.email)} alt="Me" className="w-full h-full object-cover" />
            </button>
            <h1 className="text-xl font-bold text-primary">Messages</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setActiveTab('contacts')} className="w-9 h-9 flex items-center justify-center rounded-full text-primary hover:bg-on-surface/5 transition-colors">
              <Icon name="search" size={20} />
            </button>
            <button onClick={() => setActiveTab('notifications')} className="relative w-9 h-9 flex items-center justify-center rounded-full text-primary hover:bg-on-surface/5 transition-colors">
              <Icon name="notifications" size={20} />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error border-2 border-surface rounded-full" />
            </button>
          </div>
        </header>

        {demoMode && (
          <div className="mx-3 mt-2 mb-1 px-3 py-2 rounded-xl text-center text-xs font-bold text-amber-600 border border-amber-400/20 bg-amber-400/10">
            🚀 Demo Mode — Sign up for real messaging
          </div>
        )}

        {/* Status / Stories bar */}
        <section className="py-3 overflow-x-auto custom-scrollbar flex gap-5 px-4">
          {/* My status */}
          <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group">
            <div className="relative w-14 h-14">
              <div className="w-full h-full rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center group-hover:border-primary transition-colors">
                <Icon name="add" size={22} className="text-outline group-hover:text-primary" />
              </div>
            </div>
            <span className="text-[10px] text-on-surface-variant font-medium">My Status</span>
          </div>

          {/* Friends' avatars */}
          {friends.slice(0, 6).map(friend => (
            <div
              key={friend.id}
              onClick={() => setActiveFriend(friend)}
              className={`flex flex-col items-center gap-1 shrink-0 cursor-pointer ${friend.is_online ? 'animate-status-pulse' : ''}`}
            >
              <div className="relative w-14 h-14">
                {friend.is_online ? (
                  <div className="w-full h-full rounded-full p-[2px] bg-gradient-to-tr from-primary to-tertiary">
                    <div className="bg-white p-[2px] rounded-full h-full w-full">
                      <img src={friend.avatar_url || getInitialsUrl(friend.full_name)} alt={friend.full_name} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-tertiary-fixed-dim border-2 border-white rounded-full" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full border-2 border-outline-variant p-[2px]">
                    <img src={friend.avatar_url || getInitialsUrl(friend.full_name)} alt={friend.full_name} className="w-full h-full rounded-full object-cover grayscale opacity-80" />
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-medium truncate max-w-[56px] ${friend.is_online ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                {(friend.full_name || friend.email?.split('@')[0] || '').split(' ')[0]}
              </span>
            </div>
          ))}
        </section>

        {/* Add Friend */}
        <div className="px-4 pb-3 border-b border-outline-variant/20">
          <form onSubmit={onAddFriend} className="flex gap-2">
            <div className="relative flex-1">
              <Icon name="person_search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                placeholder="Enter 4-digit friend code..."
                maxLength={6}
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                className="w-full glass-input rounded-xl py-2.5 pl-9 pr-3 text-xs text-on-surface placeholder:text-outline-variant focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="px-3 py-2 bg-primary text-white rounded-xl transition-all flex items-center justify-center hover:scale-[1.02] active:scale-95"
            >
              {searchLoading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Icon name="person_add" size={18} className="text-white" />
              }
            </button>
          </form>
          {searchError && <p className="text-[10px] text-error mt-1.5 px-1">{searchError}</p>}
          {searchSuccess && <p className="text-[10px] text-tertiary mt-1.5 px-1">{searchSuccess}</p>}
        </div>

        {/* Chat list */}
        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-outline">Recent Conversations</span>
          <span className="text-[10px] text-outline bg-surface-container px-2 py-0.5 rounded-full font-semibold">{friends.length}</span>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Icon name="forum" size={40} className="text-outline-variant mb-3" />
              <p className="text-sm text-on-surface-variant font-medium">No conversations yet</p>
              <p className="text-xs text-outline mt-1">Add friends using their 4-digit code</p>
            </div>
          ) : (
            friends.map(friend => {
              const isActive = activeFriend?.id === friend.id;
              const lastMsg = friend.lastMessage;
              const isSentByMe = lastMsg?.sender_id === myProfile?.id;

              return (
                <div
                  key={friend.id}
                  onClick={() => setActiveFriend(friend)}
                  className={`flex items-center gap-3 p-3 mx-1 my-0.5 rounded-xl cursor-pointer chat-item-hover transition-all ${isActive ? 'bg-surface-container-high shadow-sm' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden">
                      <img src={friend.avatar_url || getInitialsUrl(friend.full_name || friend.email)} alt={friend.full_name} className="w-full h-full object-cover" />
                    </div>
                    <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${friend.is_online ? 'bg-tertiary-fixed-dim' : 'bg-outline-variant'}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className={`text-sm font-semibold truncate ${isActive ? 'text-primary' : 'text-on-surface'}`}>
                        {friend.full_name || friend.email?.split('@')[0]}
                      </h3>
                      <span className={`text-[10px] shrink-0 ml-2 ${friend.unreadCount > 0 ? 'text-primary font-bold' : 'text-outline'}`}>
                        {formatTime(lastMsg?.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={`text-xs truncate ${friend.unreadCount > 0 ? 'font-semibold text-on-surface' : 'text-on-surface-variant'}`}>
                        {isSentByMe ? 'You: ' : ''}{lastMsg ? lastMsg.content : 'No messages yet'}
                      </p>
                      {friend.unreadCount > 0 && (
                        <span className="shrink-0 ml-2 bg-primary text-white text-[9px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                          {friend.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Nav */}
        <nav className="border-t border-outline-variant/20 flex justify-around items-center px-4 h-16 bg-surface/80 backdrop-blur-xl">
          {[
            { id: 'chats', icon: 'chat_bubble', label: 'Chats' },
            { id: 'calls', icon: 'call', label: 'Calls' },
            { id: 'contacts', icon: 'person_book', label: 'Contacts' },
            { id: 'profile', icon: 'account_circle', label: 'Profile' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${activeTab === tab.id ? 'bg-primary-container/20 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <Icon name={tab.icon} fill={activeTab === tab.id ? 1 : 0} size={22} />
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── CHAT WINDOW ── */}
      <section className={`${activeFriend ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden relative z-10 bg-surface/50 backdrop-blur-sm`}>
        {activeFriend ? (
          <>
            {/* Chat header */}
            <div className="h-16 px-4 border-b border-outline-variant/20 bg-surface/80 backdrop-blur-xl flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveFriend(null)}
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-on-surface/5 transition-colors"
                >
                  <Icon name="arrow_back" size={20} className="text-on-surface-variant" />
                </button>
                <div className="relative">
                  <img src={activeFriend.avatar_url || getInitialsUrl(activeFriend.full_name)} alt={activeFriend.full_name} className="w-10 h-10 rounded-full object-cover border border-outline-variant" />
                  <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${activeFriend.is_online ? 'bg-tertiary-fixed-dim' : 'bg-outline-variant'}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-on-surface">{activeFriend.full_name || activeFriend.email?.split('@')[0]}</h3>
                  <p className={`text-[10px] ${activeFriend.is_online ? 'text-tertiary font-medium' : 'text-outline'}`}>
                    {activeFriend.is_online ? '● Active now' : `Last seen ${formatTime(activeFriend.last_seen)}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setOnVoiceCallActive(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                  title="Voice Call"
                >
                  <Icon name="call" size={20} />
                </button>
                <button
                  onClick={onStartVideoCall}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors"
                  title="Video Call"
                >
                  <Icon name="videocam" size={20} />
                </button>
                <button
                  onClick={() => setActiveFriend(null)}
                  className="hidden md:flex w-9 h-9 items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/5 transition-colors"
                >
                  <Icon name="close" size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                    <Icon name="chat_bubble_outline" size={28} className="text-outline" />
                  </div>
                  <p className="text-sm text-on-surface-variant">No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMe = msg.sender_id === myProfile?.id;
                  return (
                    <div key={msg.id || i} className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}>
                      {!isMe && (
                        <img src={activeFriend.avatar_url || getInitialsUrl(activeFriend.full_name)} alt="" className="w-7 h-7 rounded-full object-cover mr-2 mt-1 self-end shrink-0" />
                      )}
                      <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm ${isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-surface-container text-on-surface rounded-tl-sm border border-outline-variant/20'}`}>
                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className={`text-[10px] ${isMe ? 'text-white/60' : 'text-outline'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <Icon name={msg.read ? 'done_all' : 'done'} size={14} className={msg.read ? 'text-tertiary-fixed-dim' : 'text-white/50'} />}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            <div className="p-3 border-t border-outline-variant/20 bg-surface/80 backdrop-blur-xl">
              <form onSubmit={onSendMessage} className="flex gap-2 items-center">
                <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/5 transition-colors">
                  <Icon name="add_circle" size={22} />
                </button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 glass-input rounded-2xl px-4 py-3 text-sm text-on-surface placeholder:text-outline-variant focus:outline-none"
                />
                <button type="button" className="w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:bg-on-surface/5 transition-colors">
                  <Icon name="sentiment_satisfied" size={22} />
                </button>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 bg-primary disabled:bg-primary/30 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-[1.05] active:scale-95 transition-all"
                >
                  <Icon name="send" fill={1} size={18} className="text-white" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-surface-container rounded-3xl flex items-center justify-center mb-6 float-animation">
              <Icon name="hub" fill={1} size={48} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-2">Nexus</h2>
            <p className="text-sm text-on-surface-variant max-w-[280px]">
              Select a conversation or add a friend to start messaging securely.
            </p>
          </div>
        )}
      </section>

      {/* ── PROFILE MODAL ── */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-[360px] glass-panel rounded-3xl p-6 shadow-2xl text-center relative">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-on-surface/5 transition-colors">
              <Icon name="close" size={18} className="text-on-surface-variant" />
            </button>
            <h3 className="text-base font-bold text-on-surface mb-5">Edit Profile</h3>

            {/* Avatar */}
            <div className="relative w-24 h-24 mx-auto mb-5 rounded-2xl overflow-hidden border-2 border-primary group cursor-pointer">
              <img src={myProfile?.avatar_url || getInitialsUrl(myProfile?.full_name || myProfile?.email)} alt="Profile" className="w-full h-full object-cover" />
              <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Icon name="photo_camera" size={20} className="text-white" />
                <span className="text-[10px] text-white mt-1">Change</span>
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={onAvatarUpload} className="hidden" />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            <form onSubmit={onUpdateProfile} className="space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider ml-1">Display Name</label>
                <div className="glass-input flex items-center px-3 py-2.5 rounded-xl mt-1">
                  <Icon name="person" size={18} className="text-outline shrink-0" />
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="bg-transparent border-none focus:ring-0 w-full text-sm text-on-surface ml-2 outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-outline uppercase tracking-wider ml-1">My Unique Code</label>
                <div className="flex items-center px-3 py-2.5 rounded-xl mt-1 bg-surface-container border border-outline-variant/30">
                  <Icon name="tag" size={18} className="text-outline shrink-0" />
                  <span className="ml-2 text-sm font-mono text-on-surface-variant select-all">{myProfile?.moon_id || '----'}</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-2.5 text-sm font-semibold text-on-surface-variant border border-outline-variant/30 rounded-xl hover:bg-surface-container transition-all">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-2.5 text-sm font-bold text-white bg-primary rounded-xl shadow-lg hover:scale-[1.01] active:scale-95 transition-all">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── INCOMING CALL OVERLAY ── */}
      {incomingCallOffer && incomingCaller && (
        <IncomingCallScreen
          caller={incomingCaller}
          onAccept={onAcceptCall}
          onDecline={onDeclineCall}
        />
      )}

      {/* ── VIDEO CALL OVERLAY ── */}
      {isVideoCallActive && activeFriend && (
        <VideoCall
          myProfile={myProfile}
          friend={activeFriend}
          isCaller={isCaller}
          initialOffer={incomingCallOffer || null}
          onEndCall={onEndVideoCall}
        />
      )}
    </div>
  );
};

// =============================================
// ROOT APP COMPONENT
// =============================================
export default function App() {
  // Auth
  const [session, setSession] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Profile & data
  const [myProfile, setMyProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Add friend
  const [searchCode, setSearchCode] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searchSuccess, setSearchSuccess] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Calls
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [incomingCallOffer, setIncomingCallOffer] = useState(null);
  const [isCaller, setIsCaller] = useState(false);
  const [voiceCallActive, setVoiceCallActive] = useState(false);

  // Navigation
  const [activeTab, setActiveTab] = useState('chats');

  const DEMO_PROFILE = {
    id: 'demo-user-local',
    full_name: 'Demo User',
    email: 'demo@nexus.app',
    moon_id: '0000',
    avatar_url: 'https://ui-avatars.com/api/?name=Demo+User&background=004ac6&color=fff&bold=true',
    is_online: true,
    last_seen: new Date().toISOString(),
  };

  // WebView Standalone Video Mode Params
  const searchParams = new URLSearchParams(window.location.search);
  const isVideoOnlyMode = searchParams.get('videoOnly') === 'true';
  const webviewToken = searchParams.get('token');
  const webviewRefresh = searchParams.get('refresh');
  const webviewFriendId = searchParams.get('friendId');
  const webviewIsCaller = searchParams.get('isCaller') === 'true';

  // Auth init
  useEffect(() => {
    const initAuth = async () => {
      if (isVideoOnlyMode && webviewToken && webviewRefresh) {
        await supabase.auth.setSession({ access_token: webviewToken, refresh_token: webviewRefresh });
      }
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) fetchMyProfile(session.user.id);
      }).finally(() => setIsInitializing(false));
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchMyProfile(session.user.id);
      } else {
        setMyProfile(null);
        setFriends([]);
        setActiveFriend(null);
        setMessages([]);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile
  const fetchMyProfile = async (userId) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      setMyProfile(data);
      setEditName(data.full_name || '');
      await supabase.from('profiles').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', userId);
      
      // If in WebView mode, automatically fetch friend and start video call
      if (isVideoOnlyMode && webviewFriendId) {
        const { data: friendData } = await supabase.from('profiles').select('*').eq('id', webviewFriendId).single();
        if (friendData) {
          setActiveFriend(friendData);
          setIsCaller(webviewIsCaller);
          setIsVideoCallActive(true);
        }
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    }
  };

  // Offline on close
  useEffect(() => {
    const handler = () => {
      if (myProfile) {
        supabase.from('profiles').update({ is_online: false, last_seen: new Date().toISOString() }).eq('id', myProfile.id).then();
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [myProfile]);

  // Fetch friends
  const fetchFriends = async () => {
    if (!myProfile) return;
    try {
      const { data: connections, error: connError } = await supabase
        .from('connections').select('*').eq('status', 'accepted')
        .or(`requester_id.eq.${myProfile.id},recipient_id.eq.${myProfile.id}`);
      if (connError) throw connError;
      if (!connections?.length) { setFriends([]); return; }

      const friendIds = connections.map(c => c.requester_id === myProfile.id ? c.recipient_id : c.requester_id);
      const { data: profiles, error: profError } = await supabase.from('profiles').select('*').in('id', friendIds);
      if (profError) throw profError;

      const enhanced = await Promise.all(profiles.map(async (friend) => {
        const { data: lastMsg } = await supabase.from('messages').select('*')
          .or(`and(sender_id.eq.${myProfile.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${myProfile.id})`)
          .order('created_at', { ascending: false }).limit(1);
        const { count } = await supabase.from('messages').select('*', { count: 'exact', head: true })
          .eq('sender_id', friend.id).eq('receiver_id', myProfile.id).eq('read', false);
        return { ...friend, lastMessage: lastMsg?.[0] || null, unreadCount: count || 0 };
      }));

      enhanced.sort((a, b) => {
        const tA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
        const tB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
        return tB - tA;
      });
      setFriends(enhanced);
    } catch (err) {
      console.error('Friends fetch error:', err);
    }
  };

  useEffect(() => { if (myProfile) fetchFriends(); }, [myProfile]);

  // Realtime subscriptions
  useEffect(() => {
    if (!myProfile) return;

    const msgCh = supabase.channel('realtime:messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new;
        if (payload.eventType === 'INSERT') {
          if (activeFriend && (msg.sender_id === activeFriend.id || msg.receiver_id === activeFriend.id)) {
            setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
            if (msg.receiver_id === myProfile.id) {
              supabase.from('messages').update({ read: true }).eq('id', msg.id).then();
            }
          }
          fetchFriends();
        } else if (payload.eventType === 'UPDATE') {
          setMessages(prev => prev.map(m => m.id === msg.id ? msg : m));
          fetchFriends();
        }
      }).subscribe();

    const profCh = supabase.channel('realtime:profiles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        const u = payload.new;
        if (activeFriend?.id === u.id) setActiveFriend(prev => ({ ...prev, ...u }));
        setFriends(prev => prev.map(f => f.id === u.id ? { ...f, ...u } : f));
      }).subscribe();

    const connCh = supabase.channel('realtime:connections')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'connections' }, () => fetchFriends())
      .subscribe();

    const callCh = supabase.channel('web:realtime:call_signals')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_signals' }, (payload) => {
        const d = payload.new;
        if (d.callee_id === myProfile.id && d.type === 'offer' && d.status === 'calling') {
          setIncomingCallOffer(d);
        }
      }).subscribe();

    return () => {
      supabase.removeChannel(msgCh);
      supabase.removeChannel(profCh);
      supabase.removeChannel(connCh);
      supabase.removeChannel(callCh);
    };
  }, [myProfile, activeFriend]);

  // Fetch messages
  const fetchMessages = async () => {
    if (!myProfile || !activeFriend) return;
    try {
      const { data, error } = await supabase.from('messages').select('*')
        .or(`and(sender_id.eq.${myProfile.id},receiver_id.eq.${activeFriend.id}),and(sender_id.eq.${activeFriend.id},receiver_id.eq.${myProfile.id})`)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);
      const unreadIds = (data || []).filter(m => m.sender_id === activeFriend.id && !m.read).map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase.from('messages').update({ read: true }).in('id', unreadIds);
        fetchFriends();
      }
    } catch (err) { console.error('Messages fetch error:', err); }
  };

  useEffect(() => { if (activeFriend) fetchMessages(); }, [activeFriend]);

  // Auth handlers
  const handleDemoLogin = () => {
    setDemoMode(true);
    setMyProfile(DEMO_PROFILE);
    setEditName(DEMO_PROFILE.full_name);
    setAuthError('');
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
      if (error) throw error;
    } catch (err) { setAuthError(err.message || 'Google auth error'); }
  };

  const handleEmailAuth = async (e, email, password, fullName) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    if (!email || !password) { setAuthError('Please enter email and password.'); setAuthLoading(false); return; }
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName || email.split('@')[0] } } });
        if (error) throw error;
        setAuthError('Success! Check your email to confirm registration.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) { setAuthError(err.message || 'Authentication failed.'); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = async () => {
    if (demoMode) { setDemoMode(false); setMyProfile(null); setFriends([]); setActiveFriend(null); setMessages([]); return; }
    try {
      if (myProfile) await supabase.from('profiles').update({ is_online: false, last_seen: new Date().toISOString() }).eq('id', myProfile.id);
      await supabase.auth.signOut();
    } catch (err) { console.error('Logout error:', err); }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    setSearchError(''); setSearchSuccess(''); setSearchLoading(true);
    const code = searchCode.trim();
    if (!code) { setSearchError('Please enter a code.'); setSearchLoading(false); return; }
    if (myProfile && code === myProfile.moon_id) { setSearchError('You cannot add yourself.'); setSearchLoading(false); return; }
    try {
      const { data: target, error: pErr } = await supabase.from('profiles').select('*').eq('moon_id', code).maybeSingle();
      if (pErr) throw pErr;
      if (!target) { setSearchError('Code not found.'); setSearchLoading(false); return; }

      const { data: existing } = await supabase.from('connections').select('*')
        .or(`and(requester_id.eq.${myProfile.id},recipient_id.eq.${target.id}),and(requester_id.eq.${target.id},recipient_id.eq.${myProfile.id})`).maybeSingle();

      if (existing) {
        if (existing.status === 'accepted') { setSearchError('Already friends.'); }
        else { await supabase.from('connections').update({ status: 'accepted' }).eq('id', existing.id); setSearchSuccess('Connection accepted!'); fetchFriends(); }
        setSearchLoading(false); setSearchCode(''); return;
      }
      await supabase.from('connections').insert({ requester_id: myProfile.id, recipient_id: target.id, status: 'accepted' });
      setSearchSuccess(`Added ${target.full_name || 'Friend'}!`);
      setSearchCode('');
      fetchFriends();
    } catch (err) { setSearchError(err.message || 'Error adding friend.'); }
    finally { setSearchLoading(false); }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeFriend || !myProfile) return;
    const content = newMessage.trim();
    setNewMessage('');
    try {
      await supabase.from('messages').insert({ sender_id: myProfile.id, receiver_id: activeFriend.id, content });
      fetchFriends();
    } catch (err) { console.error('Send message error:', err); }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!myProfile || !editName.trim()) return;
    try {
      await supabase.from('profiles').update({ full_name: editName.trim() }).eq('id', myProfile.id);
      setMyProfile(prev => ({ ...prev, full_name: editName.trim() }));
      setShowProfileModal(false);
    } catch (err) { console.error('Profile update error:', err); }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !myProfile) return;
    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${myProfile.id}/${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          await supabase.from('profiles').update({ avatar_url: reader.result }).eq('id', myProfile.id);
          setMyProfile(prev => ({ ...prev, avatar_url: reader.result }));
          setUploadingAvatar(false);
        };
        reader.readAsDataURL(file);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', myProfile.id);
      setMyProfile(prev => ({ ...prev, avatar_url: publicUrl }));
    } catch (err) { console.error('Avatar upload error:', err); }
    finally { setUploadingAvatar(false); }
  };

  // ── RENDER ──
  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-4">
          <Icon name="hub" fill={1} size={48} className="text-primary animate-pulse" />
          <p className="text-xs font-bold text-on-surface-variant tracking-widest uppercase animate-pulse">Waking up Nexus...</p>
        </div>
      </div>
    );
  }

  if (!session && !demoMode) {
    return (
      <AuthScreen
        onDemoLogin={handleDemoLogin}
        onEmailAuth={handleEmailAuth}
        onGoogleLogin={handleGoogleLogin}
        authError={authError}
        authLoading={authLoading}
        authMode={authMode}
        setAuthMode={setAuthMode}
      />
    );
  }

  if (isVideoOnlyMode && isVideoCallActive && activeFriend) {
    return (
      <VideoCall
        myProfile={myProfile}
        friend={activeFriend}
        isCaller={isCaller}
        initialOffer={null}
        onEndCall={() => window.close()}
      />
    );
  }

  return (
    <HomeScreen
      myProfile={myProfile}
      friends={friends}
      activeFriend={activeFriend}
      setActiveFriend={setActiveFriend}
      messages={messages}
      newMessage={newMessage}
      setNewMessage={setNewMessage}
      onSendMessage={handleSendMessage}
      onLogout={handleLogout}
      onAddFriend={handleAddFriend}
      searchCode={searchCode}
      setSearchCode={setSearchCode}
      searchError={searchError}
      searchSuccess={searchSuccess}
      searchLoading={searchLoading}
      showProfileModal={showProfileModal}
      setShowProfileModal={setShowProfileModal}
      editName={editName}
      setEditName={setEditName}
      onUpdateProfile={handleUpdateProfile}
      onAvatarUpload={handleAvatarUpload}
      uploadingAvatar={uploadingAvatar}
      demoMode={demoMode}
      onStartVideoCall={() => { setIsCaller(true); setIsVideoCallActive(true); }}
      onStartVoiceCall={() => setVoiceCallActive(true)}
      incomingCallOffer={incomingCallOffer}
      onAcceptCall={() => {
        const friend = friends.find(f => f.id === incomingCallOffer?.caller_id);
        if (friend) { setActiveFriend(friend); setIsCaller(false); setIsVideoCallActive(true); }
        setIncomingCallOffer(null);
      }}
      onDeclineCall={async () => {
        try {
          await supabase.from('call_signals').insert({ caller_id: myProfile.id, callee_id: incomingCallOffer.caller_id, type: 'end_call', status: 'rejected' });
        } catch (e) {}
        setIncomingCallOffer(null);
      }}
      isVideoCallActive={isVideoCallActive}
      isCaller={isCaller}
      onEndVideoCall={() => setIsVideoCallActive(false)}
      onVoiceCallActive={voiceCallActive}
      setOnVoiceCallActive={setVoiceCallActive}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    />
  );
}

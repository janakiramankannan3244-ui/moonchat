import React, { useRef } from 'react';

const Icon = ({ name, fill = 0, size = 24, className = '' }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}` }}
  >
    {name}
  </span>
);

const getInitialsUrl = (name) => {
  const n = name || 'User';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=4f46e5&color=fff&bold=true&size=200`;
};

export default function ProfileScreen({ myProfile, onBack, onEditProfile, onAvatarUpload, uploadingAvatar }) {
  const fileRef = useRef(null);

  const stats = [
    { label: 'Contacts', value: '—' },
    { label: 'Files Shared', value: '—' },
    { label: 'Channels', value: '0' },
    { label: 'Response', value: '100%' },
  ];

  return (
    <div className="flex flex-col h-full bg-background text-on-surface overflow-y-auto custom-scrollbar">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-surface-container/80 backdrop-blur-xl border-b border-outline-variant/20">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-on-surface/10 transition-colors active:scale-95">
          <Icon name="arrow_back" size={22} className="text-primary" />
        </button>
        <h1 className="text-base font-bold text-primary">My Profile</h1>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-on-surface/10 transition-colors active:scale-95">
          <Icon name="more_vert" size={22} className="text-on-surface-variant" />
        </button>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 py-6 space-y-8 pb-28">
        {/* Avatar + Edit */}
        <section className="relative flex flex-col items-center pt-4">
          <div className="relative w-36 h-36 rounded-full p-[3px] shadow-xl"
            style={{ background: 'linear-gradient(135deg, #b1c5ff 0%, #80d5b4 100%)' }}>
            <div className="w-full h-full rounded-full border-4 border-background overflow-hidden relative">
              <img
                src={myProfile?.avatar_url || getInitialsUrl(myProfile?.full_name || myProfile?.email)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {/* Online indicator */}
              {myProfile?.is_online && (
                <div className="absolute bottom-3 right-3 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full shadow-sm" />
              )}
            </div>
          </div>

          {/* Camera upload button */}
          <label
            htmlFor="profile-avatar-upload"
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold shadow-lg cursor-pointer hover:brightness-110 transition-all active:scale-95"
          >
            <Icon name="edit" fill={1} size={16} className="text-white" />
            Edit Profile
          </label>
          <input
            id="profile-avatar-upload"
            type="file"
            accept="image/*"
            onChange={onAvatarUpload}
            className="hidden"
            ref={fileRef}
          />
        </section>

        {/* Identity & Bio */}
        <section className="text-center space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">
            {myProfile?.full_name || myProfile?.email?.split('@')[0] || 'Your Name'}
          </h2>
          <p className="text-xs font-medium text-primary uppercase tracking-wider">
            {myProfile?.email || ''}
          </p>
          <div className="flex justify-center items-center gap-2 mt-1">
            <span className="text-xs bg-surface-container px-3 py-1 rounded-full border border-outline-variant/30 font-mono text-on-surface-variant">
              Code: {myProfile?.moon_id || '----'}
            </span>
          </div>
          <p className="max-w-sm mx-auto text-sm text-on-surface-variant leading-relaxed pt-2">
            Secure, end-to-end encrypted messaging. Share your code to connect instantly.
          </p>
        </section>

        {/* Quick Actions */}
        <section className="flex flex-wrap justify-center gap-3">
          {[
            { icon: 'chat_bubble', label: 'Message', color: 'bg-primary-container text-on-primary-container' },
            { icon: 'call', label: 'Audio Call', color: 'bg-secondary-container text-on-secondary-container' },
            { icon: 'videocam', label: 'Video Call', color: 'bg-tertiary-container text-on-tertiary-container' },
          ].map(({ icon, label, color }) => (
            <button key={label} className={`flex items-center gap-2 px-5 py-2.5 ${color} rounded-xl text-xs font-semibold hover:brightness-110 transition-all active:scale-95`}>
              <Icon name={icon} size={18} />
              <span>{label}</span>
            </button>
          ))}
        </section>

        {/* Stats grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(({ label, value }) => (
            <div key={label} className="bg-surface-container-lowest p-4 rounded-xl text-center border border-outline-variant/20">
              <span className="block text-xl font-bold text-primary">{value}</span>
              <span className="text-[10px] font-medium text-outline uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </section>

        {/* Shared Media */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-on-surface">Shared Media</h3>
            <button className="text-xs text-primary font-semibold hover:underline">View all</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl overflow-hidden bg-surface-container border border-outline-variant/20 flex items-center justify-center group cursor-pointer hover:border-primary/40 transition-all"
              >
                <Icon name="image" size={28} className="text-outline opacity-40 group-hover:opacity-70 transition-opacity" />
              </div>
            ))}
          </div>
          <p className="text-xs text-outline text-center">No media shared yet.</p>
        </section>

        {/* Documents */}
        <section className="space-y-3">
          <h3 className="text-base font-bold text-on-surface">Documents</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:bg-surface-container transition-colors group">
              <div className="w-10 h-10 flex items-center justify-center bg-error-container/40 text-error rounded-lg shrink-0">
                <Icon name="picture_as_pdf" fill={1} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">No documents shared yet</p>
                <p className="text-[10px] text-outline">Files shared in chats will appear here</p>
              </div>
              <Icon name="download" size={20} className="text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </section>

        {/* Settings / Danger */}
        <section className="space-y-2 pt-2">
          <h3 className="text-base font-bold text-on-surface mb-3">Account</h3>
          {[
            { icon: 'lock', label: 'Privacy & Security', color: 'text-primary' },
            { icon: 'notifications', label: 'Notification Settings', color: 'text-primary' },
            { icon: 'language', label: 'Language', color: 'text-primary' },
            { icon: 'logout', label: 'Log Out', color: 'text-error' },
          ].map(({ icon, label, color }) => (
            <button
              key={label}
              className="w-full flex items-center gap-3 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/20 hover:bg-surface-container transition-colors text-left group"
            >
              <Icon name={icon} size={20} className={color} />
              <span className={`text-sm font-medium flex-1 ${color === 'text-error' ? 'text-error' : 'text-on-surface'}`}>{label}</span>
              <Icon name="chevron_right" size={18} className="text-outline" />
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}

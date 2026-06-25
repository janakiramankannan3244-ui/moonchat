import React, { useState, useRef, useEffect } from 'react';

const Icon = ({ name, fill = 0, size = 24, className = '' }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}` }}
  >
    {name}
  </span>
);

const getInitialsUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=4f46e5&color=fff&bold=true`;

export default function ContactsScreen({ friends, myProfile, onSelectFriend, onAddFriend, searchCode, setSearchCode, searchLoading, searchError, searchSuccess, onBack }) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState(['Yesterday', 'Design Team', 'Tech Support']);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = friends.filter(f => {
    const name = (f.full_name || f.email || '').toLowerCase();
    return name.includes(query.toLowerCase());
  });

  const handleSelectFriend = (friend) => {
    const name = friend.full_name || friend.email?.split('@')[0] || 'Unknown';
    if (!recentSearches.includes(name)) {
      setRecentSearches(prev => [name, ...prev].slice(0, 5));
    }
    onSelectFriend(friend);
  };

  return (
    <div className="flex flex-col h-full bg-background text-on-surface overflow-y-auto custom-scrollbar">
      {/* Atmospheric blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-surface-dim/80 backdrop-blur-xl border-b border-outline-variant/20">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-on-surface/10 transition-colors active:scale-95">
          <Icon name="arrow_back" size={22} className="text-primary" />
        </button>
        <h1 className="text-base font-bold text-primary">Contacts</h1>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-on-surface/5 transition-colors active:scale-95">
          <Icon name="more_vert" size={22} className="text-on-surface-variant" />
        </button>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 py-6 space-y-8 pb-28">
        {/* Search bar */}
        <section>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-700" />
            <div className="relative bg-surface-container-high/70 border border-outline-variant/30 rounded-2xl flex items-center px-5 py-3.5 shadow-sm group-focus-within:ring-2 ring-primary/40 transition-all">
              <Icon name="search" size={20} className="text-primary mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search contacts or start a new chat..."
                className="bg-transparent border-none focus:ring-0 w-full text-sm text-on-surface placeholder:text-on-surface-variant/60 outline-none"
              />
              {query && (
                <button onClick={() => setQuery('')} className="p-1 rounded-full hover:bg-white/10 transition-colors ml-2">
                  <Icon name="close" size={18} className="text-on-surface-variant" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Add by code */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-on-surface uppercase tracking-wider px-1">Add by Code</h2>
          <form onSubmit={onAddFriend} className="flex gap-2">
            <div className="relative flex-1">
              <Icon name="tag" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                placeholder="Enter 4-digit friend code..."
                maxLength={6}
                value={searchCode}
                onChange={e => setSearchCode(e.target.value)}
                className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl py-3 pl-9 pr-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading || !searchCode.trim()}
              className="px-4 py-3 bg-primary text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
            >
              {searchLoading
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><Icon name="person_add" size={16} className="text-white" /> Add</>
              }
            </button>
          </form>
          {searchError && <p className="text-xs text-error px-1">{searchError}</p>}
          {searchSuccess && <p className="text-xs text-tertiary px-1">{searchSuccess}</p>}
        </section>

        {/* Recent searches */}
        {!query && recentSearches.length > 0 && (
          <section className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-sm font-bold text-on-surface">Recent</h2>
              <button onClick={() => setRecentSearches([])} className="text-xs text-primary font-semibold uppercase tracking-wider hover:underline">
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(s => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/40 px-3 py-2 rounded-xl hover:bg-surface-container transition-colors group text-sm text-on-surface-variant"
                >
                  <Icon name="history" size={16} className="text-outline" />
                  <span>{s}</span>
                  <Icon
                    name="close"
                    size={13}
                    className="text-outline opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* All contacts / filtered */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold text-on-surface px-1">
            {query ? `Results for "${query}"` : 'All Contacts'}
            <span className="ml-2 text-xs text-outline font-normal">({filtered.length})</span>
          </h2>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                <Icon name="person_search" size={32} className="text-outline" />
              </div>
              <p className="text-sm text-on-surface-variant font-medium">No contacts found</p>
              <p className="text-xs text-outline mt-1">Try adding someone with their friend code above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map(friend => (
                <div
                  key={friend.id}
                  className="bg-surface-container-low/60 border border-outline-variant/25 p-4 rounded-2xl flex items-center justify-between group hover:border-primary/40 hover:bg-surface-container transition-all cursor-pointer"
                  onClick={() => handleSelectFriend(friend)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-outline-variant">
                        <img
                          src={friend.avatar_url || getInitialsUrl(friend.full_name || friend.email)}
                          alt={friend.full_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-background ${friend.is_online ? 'bg-emerald-500' : 'bg-outline-variant'}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface">
                        {friend.full_name || friend.email?.split('@')[0]}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        {friend.is_online ? '● Online' : 'Offline'} · Code: {friend.moon_id || '----'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleSelectFriend(friend); }}
                    className="bg-primary hover:brightness-110 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1"
                  >
                    <Icon name="chat_bubble" size={14} className="text-white" />
                    Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* People you may know (placeholder) */}
        {!query && (
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-on-surface px-1">Invite Friends</h2>
            <div className="bg-surface-container/40 border border-outline-variant/25 rounded-2xl p-5 flex flex-col items-center text-center gap-3">
              <div className="w-14 h-14 bg-primary/15 rounded-full flex items-center justify-center float-animation">
                <Icon name="group_add" size={28} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-on-surface">Share your code</p>
                <p className="text-xs text-on-surface-variant mt-1">Friends can add you using your unique code</p>
                <div className="mt-3 inline-flex items-center gap-2 bg-surface-container-highest px-4 py-2 rounded-xl border border-outline-variant/30">
                  <Icon name="tag" size={16} className="text-primary" />
                  <span className="text-base font-mono font-bold text-primary tracking-widest">
                    {myProfile?.moon_id || '----'}
                  </span>
                  <button
                    onClick={() => navigator.clipboard.writeText(myProfile?.moon_id || '')}
                    className="ml-1 text-outline hover:text-primary transition-colors active:scale-95"
                  >
                    <Icon name="content_copy" size={15} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

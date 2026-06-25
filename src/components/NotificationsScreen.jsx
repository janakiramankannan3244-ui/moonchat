import React, { useState } from 'react';

const Icon = ({ name, fill = 0, size = 24, className = '' }) => (
  <span
    className={`material-symbols-outlined ${className}`}
    style={{ fontSize: size, fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}` }}
  >
    {name}
  </span>
);

const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    group: 'messages',
    type: 'message',
    from: 'Sarah Jenkins',
    preview: '"Hey! I\'ve attached the final design guidelines for the Q3 project. Let me know what you think!"',
    time: '2m ago',
    unread: true,
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=006242&color=fff&bold=true',
    online: true,
  },
  {
    id: 2,
    group: 'messages',
    type: 'message',
    from: 'Product Team',
    preview: 'Alex: "Just pushed the latest updates to staging..."',
    time: '15m ago',
    unread: true,
    avatar: 'https://ui-avatars.com/api/?name=Product+Team&background=004ac6&color=fff&bold=true',
    online: false,
  },
  {
    id: 3,
    group: 'friend_requests',
    type: 'friend_request',
    from: 'Marcus Thorne',
    subtitle: 'Wants to connect with you',
    time: '1h ago',
    avatar: 'https://ui-avatars.com/api/?name=Marcus+Thorne&background=4648d4&color=fff&bold=true',
  },
  {
    id: 4,
    group: 'system',
    type: 'security',
    icon: 'security',
    title: 'Security Patch Applied',
    preview: 'Your account was updated with the latest end-to-end encryption protocols.',
    time: '3h ago',
    color: 'text-tertiary',
    bgColor: 'bg-tertiary-container/30',
    borderColor: 'border-l-tertiary',
  },
  {
    id: 5,
    group: 'system',
    type: 'backup',
    icon: 'cloud_done',
    title: 'Backup Successful',
    preview: 'All your messages and media have been securely synced to cloud storage.',
    time: 'Yesterday',
    color: 'text-primary',
    bgColor: 'bg-primary-container/20',
    borderColor: 'border-l-primary',
  },
];

export default function NotificationsScreen({ onBack }) {
  const [notifications, setNotifications] = useState(DEMO_NOTIFICATIONS);
  const [allRead, setAllRead] = useState(false);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    setAllRead(true);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const messageNotifs = notifications.filter(n => n.group === 'messages');
  const friendNotifs = notifications.filter(n => n.group === 'friend_requests');
  const systemNotifs = notifications.filter(n => n.group === 'system');

  return (
    <div className="flex flex-col h-full bg-background text-on-surface overflow-y-auto custom-scrollbar">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-4 h-14 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-on-surface/10 transition-colors active:scale-95">
          <Icon name="arrow_back" size={22} className="text-primary" />
        </button>
        <h1 className="text-base font-bold text-primary">Notifications</h1>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-on-surface/5 transition-colors active:scale-95">
          <Icon name="search" size={22} className="text-on-surface-variant" />
        </button>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 py-6 space-y-8 pb-28">
        {/* Header controls */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">Activity</h2>
            <p className="text-sm text-on-surface-variant mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          <button
            onClick={markAllRead}
            disabled={allRead || unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary text-xs font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="done_all" size={16} />
            Mark all read
          </button>
        </div>

        {/* Messages */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Icon name="chat_bubble" size={18} className="text-primary" />
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Messages</h3>
            {messageNotifs.some(n => n.unread) && (
              <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold">
                {messageNotifs.filter(n => n.unread).length} NEW
              </span>
            )}
          </div>

          <div className="bg-surface-container/40 backdrop-blur-sm border border-outline-variant/25 rounded-2xl overflow-hidden">
            {messageNotifs.map((notif, i) => (
              <div key={notif.id}>
                {i > 0 && <div className="h-px bg-outline-variant/15 mx-4" />}
                <div
                  onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n))}
                  className="relative flex gap-3 p-4 hover:bg-on-surface/5 transition-colors cursor-pointer"
                >
                  {notif.unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-xl overflow-hidden">
                      <img src={notif.avatar} alt={notif.from} className="w-full h-full object-cover" />
                    </div>
                    {notif.online && (
                      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-surface rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className={`text-sm font-semibold truncate ${notif.unread ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                        {notif.from}
                      </p>
                      <span className="text-[10px] text-on-surface-variant whitespace-nowrap ml-2">{notif.time}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2 leading-relaxed">{notif.preview}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Friend Requests */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Icon name="person_add" size={18} className="text-secondary" />
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">Friend Requests</h3>
          </div>

          <div className="bg-surface-container/40 backdrop-blur-sm border border-outline-variant/25 rounded-2xl p-4 space-y-4">
            {friendNotifs.length === 0 ? (
              <p className="text-xs text-outline text-center py-4">No pending friend requests.</p>
            ) : (
              friendNotifs.map(notif => (
                <div key={notif.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={notif.avatar} alt={notif.from} className="w-12 h-12 rounded-full object-cover border-2 border-outline-variant" />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{notif.from}</p>
                      <p className="text-xs text-on-surface-variant">{notif.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-15">
                    <button
                      onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                      className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:brightness-110 active:scale-95 transition-all"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => setNotifications(prev => prev.filter(n => n.id !== notif.id))}
                      className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold hover:bg-surface-container-highest active:scale-95 transition-all"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* System Updates */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Icon name="notifications_active" size={18} className="text-tertiary" />
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-wider">System</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {systemNotifs.map(notif => (
              <div
                key={notif.id}
                className={`bg-surface-container/40 backdrop-blur-sm border border-outline-variant/25 border-l-4 ${notif.borderColor} rounded-2xl p-5 hover:shadow-md transition-all`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-10 h-10 rounded-xl ${notif.bgColor} flex items-center justify-center`}>
                    <Icon name={notif.icon} size={20} className={notif.color} />
                  </div>
                  <span className="text-[10px] text-on-surface-variant">{notif.time}</span>
                </div>
                <h4 className="text-sm font-bold text-on-surface mb-1">{notif.title}</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">{notif.preview}</p>
                <div className="mt-4 pt-3 border-t border-outline-variant/15 flex justify-end">
                  <button className={`${notif.color} text-xs font-semibold hover:underline flex items-center gap-1`}>
                    Details <Icon name="arrow_forward" size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

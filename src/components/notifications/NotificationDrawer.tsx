import React, { useState } from 'react';
import {
  X,
  Bell,
  Mail,
  Smartphone,
  ShieldAlert,
  Send,
  CheckCircle2,
  Calendar,
  Clock,
  Check,
} from 'lucide-react';
import { NotificationItem, Reservation } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onTriggerCustomReminder: (title: string, recipient: string, message: string, channel: 'email' | 'sms') => void;
  reservations: Reservation[];
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onTriggerCustomReminder,
  reservations,
}) => {
  const [filter, setFilter] = useState<'all' | 'guest' | 'staff'>('all');
  const [showCompose, setShowCompose] = useState(false);
  const [composeRecipient, setComposeRecipient] = useState(
    reservations[0]?.guestEmail || 'guest@example.com'
  );
  const [composeChannel, setComposeChannel] = useState<'email' | 'sms'>('email');
  const [composeTitle, setComposeTitle] = useState('Welcome to Float: Arrival Notice');
  const [composeMessage, setComposeMessage] = useState(
    'Your overwater villa is ready for early check-in. Our private catamaran will greet you at the main pier.'
  );

  if (!isOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'guest') return n.type === 'booking_confirmation' || n.type === 'guest_reminder';
    if (filter === 'staff') return n.type === 'staff_alert' || n.type === 'checkin_ready';
    return true;
  });

  const handleSendCustom = (e: React.FormEvent) => {
    e.preventDefault();
    onTriggerCustomReminder(composeTitle, composeRecipient, composeMessage, composeChannel);
    setShowCompose(false);
  };

  return (
    <div
      id="notification-drawer"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#09121a]/95 backdrop-blur-2xl border-l border-white/10 text-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#060c11]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-medium text-white">
              Automated Notification Center
            </h3>
            <span className="text-[10px] text-white/50 font-meta">
              Real-Time Email, SMS & System Dispatches
            </span>
          </div>
        </div>

        <button
          id="btn-close-notification-drawer"
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Tabs & Actions */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#d4af37] text-black font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('guest')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === 'guest'
                ? 'bg-[#d4af37] text-black font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Guest Alerts
          </button>
          <button
            onClick={() => setFilter('staff')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              filter === 'staff'
                ? 'bg-[#d4af37] text-black font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Staff Feeds
          </button>
        </div>

        <button
          onClick={onMarkAllAsRead}
          className="text-[11px] text-[#d4af37] hover:underline cursor-pointer"
        >
          Mark all read
        </button>
      </div>

      {/* Trigger Custom Notification button */}
      <div className="p-3.5 bg-indigo-950/30 border-b border-indigo-500/20 px-5 flex items-center justify-between">
        <span className="text-xs text-indigo-200">Test or dispatch automated reminders</span>
        <button
          id="btn-compose-notification"
          onClick={() => setShowCompose(!showCompose)}
          className="px-3 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium hover:bg-indigo-500/30 flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3 h-3" />
          <span>{showCompose ? 'Close Form' : 'Send Reminder'}</span>
        </button>
      </div>

      {/* Compose Form */}
      {showCompose && (
        <form onSubmit={handleSendCustom} className="p-4 bg-[#0d171f] border-b border-white/10 space-y-3 text-xs">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setComposeChannel('email')}
              className={`flex-1 py-1.5 rounded-lg border text-center cursor-pointer ${
                composeChannel === 'email'
                  ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300'
                  : 'border-white/10 text-white/60'
              }`}
            >
              Email Notification
            </button>
            <button
              type="button"
              onClick={() => setComposeChannel('sms')}
              className={`flex-1 py-1.5 rounded-lg border text-center cursor-pointer ${
                composeChannel === 'sms'
                  ? 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                  : 'border-white/10 text-white/60'
              }`}
            >
              SMS Alert
            </button>
          </div>

          <div>
            <label className="text-[10px] text-white/50 block mb-0.5">Recipient</label>
            <input
              type="text"
              value={composeRecipient}
              onChange={(e) => setComposeRecipient(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-white/50 block mb-0.5">Subject / Header</label>
            <input
              type="text"
              value={composeTitle}
              onChange={(e) => setComposeTitle(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white"
              required
            />
          </div>

          <div>
            <label className="text-[10px] text-white/50 block mb-0.5">Notification Body</label>
            <textarea
              value={composeMessage}
              onChange={(e) => setComposeMessage(e.target.value)}
              rows={2}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-[#d4af37] text-black font-semibold text-xs cursor-pointer shadow-md"
          >
            Dispatch Automated Alert
          </button>
        </form>
      )}

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-white/40 text-xs">
            No notifications in this category.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3.5 rounded-xl border transition-all ${
                notif.read
                  ? 'bg-white/[0.02] border-white/5 text-white/70'
                  : 'bg-white/[0.05] border-[#d4af37]/30 text-white shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5">
                  {notif.channel === 'email' && <Mail className="w-3.5 h-3.5 text-blue-400" />}
                  {notif.channel === 'sms' && <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
                  {notif.channel === 'system' && <ShieldAlert className="w-3.5 h-3.5 text-[#d4af37]" />}
                  <span className="font-semibold text-xs text-white">{notif.title}</span>
                </div>
                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-[#d4af37] shrink-0" />
                )}
              </div>

              <p className="text-xs text-white/80 leading-relaxed font-sans">
                {notif.message}
              </p>

              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 font-meta">
                <span className="truncate max-w-[180px]">To: {notif.recipient}</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

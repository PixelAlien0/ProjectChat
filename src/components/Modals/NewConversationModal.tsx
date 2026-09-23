import React, { useState } from 'react';
import { User, Conversation } from '../../types';
import { StatusBadge } from '../common/SvgIcons';
import { 
  X, 
  Hash, 
  Users, 
  Lock, 
  Plus 
} from 'lucide-react';

interface NewConversationModalProps {
  users: User[];
  activeUser: User;
  existingConversations: Conversation[];
  onClose: () => void;
  onCreateChannel: (name: string, topic: string, isPrivate: boolean) => void;
  onStartDm: (userId: string) => void;
}

export const NewConversationModal: React.FC<NewConversationModalProps> = ({
  users,
  activeUser,
  existingConversations,
  onClose,
  onCreateChannel,
  onStartDm
}) => {
  const [tab, setTab] = useState<'channel' | 'dm'>('channel');
  const [channelName, setChannelName] = useState('');
  const [channelTopic, setChannelTopic] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const availableDmUsers = users.filter((u) => u.id !== activeUser.id);

  const handleChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    // Normalize channel name: lowercase, dashes
    const formatted = channelName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
    onCreateChannel(formatted, channelTopic.trim(), isPrivate);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-outline)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface-container)'
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            New Conversation
          </h2>
          <button className="icon-btn" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={17} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-outline)' }}>
          <button
            onClick={() => setTab('channel')}
            style={{
              flex: 1,
              padding: '12px 0',
              fontSize: '13px',
              fontWeight: 600,
              color: tab === 'channel' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: tab === 'channel' ? '2px solid var(--color-primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Hash size={16} />
            <span>Create Channel</span>
          </button>

          <button
            onClick={() => setTab('dm')}
            style={{
              flex: 1,
              padding: '12px 0',
              fontSize: '13px',
              fontWeight: 600,
              color: tab === 'dm' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: tab === 'dm' ? '2px solid var(--color-primary)' : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Users size={16} />
            <span>Direct Message</span>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px' }}>
          {tab === 'channel' ? (
            <form onSubmit={handleChannelSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Channel Name
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--md-shape-corner-md)',
                    border: '1px solid var(--color-outline)'
                  }}
                >
                  <Hash size={16} color="var(--color-text-muted)" style={{ marginRight: '6px' }} />
                  <input
                    type="text"
                    placeholder="e.g. platform-architecture"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    required
                    style={{ flex: 1, fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Topic or Purpose (Optional)
                </label>
                <input
                  type="text"
                  placeholder="What is this channel about?"
                  value={channelTopic}
                  onChange={(e) => setChannelTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--md-shape-corner-md)',
                    border: '1px solid var(--color-outline)',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <input
                  type="checkbox"
                  id="private-chk"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="private-chk" style={{ fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Lock size={13} color="var(--color-text-muted)" />
                  Make private (invite only)
                </label>
              </div>

              <button
                type="submit"
                className="send-btn"
                style={{ width: '100%', justifyContent: 'center', marginTop: '8px', padding: '10px 0' }}
              >
                Create Channel
              </button>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Select a teammate to start chatting:
              </span>
              {availableDmUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    onStartDm(user.id);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--md-shape-corner-md)',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-outline)',
                    cursor: 'pointer',
                    transition: 'all 120ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container-high)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface)')}
                >
                  <div style={{ position: 'relative', width: '36px', height: '36px' }}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', bottom: '-1px', right: '-1px' }}>
                      <StatusBadge status={user.status} size={8} />
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{user.name}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>{user.role}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

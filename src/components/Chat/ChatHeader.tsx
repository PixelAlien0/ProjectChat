import React from 'react';
import { Conversation, User } from '../../types';
import { StatusBadge } from '../common/SvgIcons';
import { 
  Hash, 
  Lock, 
  Phone, 
  Video, 
  Pin, 
  Sidebar as SidebarIcon, 
  Search,
  Users
} from 'lucide-react';

interface ChatHeaderProps {
  conversation: Conversation;
  activeUser: User;
  users: User[];
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onToggleSearch: () => void;
  onTogglePinned: () => void;
  pinnedCount: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  activeUser,
  users,
  isDrawerOpen,
  onToggleDrawer,
  onToggleSearch,
  onTogglePinned,
  pinnedCount
}) => {
  // If DM, get the other user
  const dmUser = conversation.type === 'dm'
    ? users.find((u) => u.id === (conversation.memberIds.find((id) => id !== activeUser.id) || conversation.memberIds[0]))
    : null;

  const handleStartCall = (type: 'audio' | 'video') => {
    alert(`Initiating secure WebRTC ${type} session with ${dmUser ? dmUser.name : '#' + conversation.name}... (Simulated)`);
  };

  return (
    <header
      style={{
        height: '64px',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-outline)',
        backgroundColor: 'var(--color-surface)',
        zIndex: 10
      }}
    >
      {/* Title & Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        {conversation.type === 'dm' && dmUser ? (
          <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
            <img
              src={dmUser.avatar}
              alt={dmUser.name}
              style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }}
            />
            <span style={{ position: 'absolute', bottom: '-1px', right: '-1px' }}>
              <StatusBadge status={dmUser.status} size={9} />
            </span>
          </div>
        ) : (
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--color-surface-container-high)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-secondary)',
              flexShrink: 0
            }}
          >
            {conversation.isPrivate ? <Lock size={18} /> : <Hash size={18} />}
          </div>
        )}

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {conversation.type === 'dm' && dmUser ? dmUser.name : '#' + conversation.name}
            </h1>
            {conversation.type === 'dm' && dmUser && (
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {dmUser.role}
              </span>
            )}
          </div>

          <div
            style={{
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {conversation.type === 'dm' && dmUser
              ? dmUser.statusMessage || `Local time: ${dmUser.timezone}`
              : conversation.topic || `${conversation.memberIds.length} members`}
          </div>
        </div>
      </div>

      {/* Right Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          className="icon-btn"
          onClick={() => handleStartCall('audio')}
          title="Start Voice Call"
          style={{ width: '36px', height: '36px' }}
        >
          <Phone size={17} />
        </button>

        <button
          className="icon-btn"
          onClick={() => handleStartCall('video')}
          title="Start Video Meeting"
          style={{ width: '36px', height: '36px' }}
        >
          <Video size={18} />
        </button>

        <button
          className="icon-btn"
          onClick={onTogglePinned}
          title={`Pinned Messages (${pinnedCount})`}
          style={{ width: '36px', height: '36px', position: 'relative' }}
        >
          <Pin size={17} />
          {pinnedCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                fontSize: '9px',
                fontWeight: 700,
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                borderRadius: '50%',
                width: '14px',
                height: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {pinnedCount}
            </span>
          )}
        </button>

        <button
          className="icon-btn"
          onClick={onToggleSearch}
          title="Search in Conversation"
          style={{ width: '36px', height: '36px' }}
        >
          <Search size={17} />
        </button>

        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-outline)', margin: '0 4px' }} />

        <button
          className={`icon-btn ${isDrawerOpen ? 'active' : ''}`}
          onClick={onToggleDrawer}
          title="Toggle Details Drawer"
          style={{ width: '36px', height: '36px' }}
        >
          <SidebarIcon size={18} />
        </button>
      </div>
    </header>
  );
};

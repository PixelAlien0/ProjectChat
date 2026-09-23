import React, { useState } from 'react';
import { User, MongoConfig } from '../../types';
import { StatusBadge } from '../common/SvgIcons';
import { 
  MessageSquare, 
  Hash, 
  Users, 
  Database, 
  Sun, 
  Moon, 
  Check, 
  ChevronUp, 
  Layers
} from 'lucide-react';

interface ActivityRailProps {
  users: User[];
  activeUser: User;
  onSelectUser: (user: User) => void;
  mongoConfig: MongoConfig;
  onOpenMongoModal: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  activeTab: 'all' | 'channels' | 'dms';
  onSelectTab: (tab: 'all' | 'channels' | 'dms') => void;
  unreadCount: number;
}

export const ActivityRail: React.FC<ActivityRailProps> = ({
  users,
  activeUser,
  onSelectUser,
  mongoConfig,
  onOpenMongoModal,
  theme,
  onToggleTheme,
  activeTab,
  onSelectTab,
  unreadCount
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  return (
    <aside className="activity-rail" aria-label="Activity Rail">
      {/* Top Brand Logo */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <div
          title="PulseChat - Design-System Messaging"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
            cursor: 'pointer'
          }}
        >
          <Layers size={22} strokeWidth={2.5} />
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
          <button
            className={`icon-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => onSelectTab('all')}
            title="All Conversations"
          >
            <MessageSquare size={20} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--color-primary)',
                  borderRadius: '50%'
                }}
              />
            )}
          </button>

          <button
            className={`icon-btn ${activeTab === 'channels' ? 'active' : ''}`}
            onClick={() => onSelectTab('channels')}
            title="Channels"
          >
            <Hash size={20} />
          </button>

          <button
            className={`icon-btn ${activeTab === 'dms' ? 'active' : ''}`}
            onClick={() => onSelectTab('dms')}
            title="Direct Messages"
          >
            <Users size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Tools & Persona Switcher */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        {/* MongoDB Atlas Status */}
        <button
          className="icon-btn"
          onClick={onOpenMongoModal}
          title={`MongoDB Atlas (${mongoConfig.isConnected ? 'Connected' : 'Configure'})`}
          style={{ position: 'relative' }}
        >
          <Database size={19} color={mongoConfig.isConnected ? '#10b981' : 'var(--color-text-secondary)'} />
          <span
            style={{
              position: 'absolute',
              bottom: '6px',
              right: '6px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: mongoConfig.isConnected ? '#10b981' : '#f59e0b',
              boxShadow: '0 0 0 2px var(--color-surface-dim)'
            }}
          />
        </button>

        {/* Theme Toggle */}
        <button
          className="icon-btn"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* Active User Avatar & Persona Switcher Popover */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            title={`Active: ${activeUser.name} (${activeUser.role}) - Click to Switch Persona`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              padding: 0,
              position: 'relative',
              overflow: 'visible'
            }}
          >
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '2px solid var(--color-primary)'
              }}
            />
            <span style={{ position: 'absolute', bottom: '-2px', right: '-2px' }}>
              <StatusBadge status={activeUser.status} size={9} />
            </span>
          </button>

          {/* Persona Dropdown */}
          {showPersonaMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '52px',
                width: '260px',
                backgroundColor: 'var(--color-surface-container-high)',
                border: '1px solid var(--color-outline)',
                borderRadius: 'var(--md-shape-corner-lg)',
                boxShadow: 'var(--elevation-3)',
                padding: '8px',
                zIndex: 100,
                animation: 'modalIn 180ms ease'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted)',
                  padding: '6px 8px 4px 8px'
                }}
              >
                Switch Active Persona
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', padding: '0 8px 8px' }}>
                Test authentic multi-user messaging right in this browser.
              </p>

              {users.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    setShowPersonaMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--md-shape-corner-sm)',
                    cursor: 'pointer',
                    backgroundColor: user.id === activeUser.id ? 'var(--color-primary-container)' : 'transparent',
                    color: user.id === activeUser.id ? 'var(--color-primary)' : 'inherit',
                    transition: 'all 120ms ease'
                  }}
                >
                  <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <span style={{ position: 'absolute', bottom: '-1px', right: '-1px' }}>
                      <StatusBadge status={user.status} size={7} />
                    </span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</span>
                      {user.id === activeUser.id && <Check size={14} />}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

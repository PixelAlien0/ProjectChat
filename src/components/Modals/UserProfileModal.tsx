import React, { useState } from 'react';
import { User, UserStatus } from '../../types';
import { StatusBadge } from '../common/SvgIcons';
import { 
  X, 
  UserCheck, 
  Camera, 
  Check 
} from 'lucide-react';

interface UserProfileModalProps {
  currentUser: User;
  onSave: (user: User) => void;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  onSave,
  onClose
}) => {
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username);
  const [role, setRole] = useState(currentUser.role || 'Member');
  const [statusMessage, setStatusMessage] = useState(currentUser.statusMessage || '');
  const [status, setStatus] = useState<UserStatus>(currentUser.status);
  const [avatar, setAvatar] = useState(currentUser.avatar);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      username: username.trim() || name.toLowerCase().replace(/\s+/g, '.'),
      role: role.trim(),
      statusMessage: statusMessage.trim(),
      status,
      avatar
    };

    onSave(updatedUser);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={18} color="var(--color-primary)" />
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Edit Your Profile (Real People)
            </h2>
          </div>
          <button className="icon-btn" onClick={onClose} style={{ width: '32px', height: '32px' }}>
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Avatar selector */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '64px', height: '64px' }}>
              <img
                src={avatar}
                alt={name}
                style={{ width: '100%', height: '100%', borderRadius: '18px', objectFit: 'cover', border: '2px solid var(--color-primary)' }}
              />
              <span style={{ position: 'absolute', bottom: '0', right: '0' }}>
                <StatusBadge status={status} size={12} />
              </span>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {PRESET_AVATARS.map((pAvatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(pAvatar)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: avatar === pAvatar ? '2px solid var(--color-primary)' : '1px solid var(--color-outline)',
                    padding: 0,
                    cursor: 'pointer'
                  }}
                >
                  <img src={pAvatar} alt="preset" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '9px 12px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--md-shape-corner-md)',
                border: '1px solid var(--color-outline)',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Role / Job Title */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Your Role / Headline
            </label>
            <input
              type="text"
              placeholder="e.g. Senior Developer, Product Designer, Team Lead"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--md-shape-corner-md)',
                border: '1px solid var(--color-outline)',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Status Message */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Status Message
            </label>
            <input
              type="text"
              placeholder="e.g. Working on the new release"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--md-shape-corner-md)',
                border: '1px solid var(--color-outline)',
                fontSize: '13px'
              }}
            />
          </div>

          {/* Online status picker */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
              Presence Status
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['online', 'away', 'busy', 'offline'] as UserStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatus(st)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 'var(--md-shape-corner-sm)',
                    border: status === st ? '1px solid var(--color-primary)' : '1px solid var(--color-outline)',
                    backgroundColor: status === st ? 'var(--color-primary-container)' : 'var(--color-surface)',
                    color: status === st ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <StatusBadge status={st} size={7} />
                  <span>{st}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="send-btn"
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '10px 0' }}
          >
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

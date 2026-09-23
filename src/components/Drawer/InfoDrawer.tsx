import React, { useState } from 'react';
import { Conversation, User, Message } from '../../types';
import { StatusBadge } from '../common/SvgIcons';
import { 
  X, 
  Hash, 
  Lock, 
  Mail, 
  Clock, 
  Pin, 
  Image as ImageIcon, 
  FileText, 
  Bell, 
  ShieldCheck 
} from 'lucide-react';

interface InfoDrawerProps {
  conversation: Conversation;
  activeUser: User;
  users: User[];
  messages: Message[];
  onClose: () => void;
  onSelectMessage?: (messageId: string) => void;
}

export const InfoDrawer: React.FC<InfoDrawerProps> = ({
  conversation,
  activeUser,
  users,
  messages,
  onClose,
  onSelectMessage
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'pinned' | 'media'>('details');

  const dmUser = conversation.type === 'dm'
    ? users.find((u) => u.id === (conversation.memberIds.find((id) => id !== activeUser.id) || conversation.memberIds[0]))
    : null;

  const pinnedMessages = messages.filter((m) => m.isPinned);
  const mediaMessages = messages.filter((m) => m.attachments && m.attachments.length > 0);

  return (
    <aside className="info-drawer-pane" aria-label="Details Drawer">
      {/* Header */}
      <div
        style={{
          height: '64px',
          padding: '0 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--color-outline)'
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          {conversation.type === 'dm' ? 'User Profile' : 'Channel Details'}
        </span>
        <button className="icon-btn" onClick={onClose} title="Close drawer" style={{ width: '32px', height: '32px' }}>
          <X size={17} />
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--color-outline)',
          backgroundColor: 'var(--color-surface-container-lowest)'
        }}
      >
        <button
          onClick={() => setActiveTab('details')}
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: '12px',
            fontWeight: 600,
            color: activeTab === 'details' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'details' ? '2px solid var(--color-primary)' : '2px solid transparent'
          }}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('pinned')}
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: '12px',
            fontWeight: 600,
            color: activeTab === 'pinned' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'pinned' ? '2px solid var(--color-primary)' : '2px solid transparent'
          }}
        >
          Pinned ({pinnedMessages.length})
        </button>
        <button
          onClick={() => setActiveTab('media')}
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: '12px',
            fontWeight: 600,
            color: activeTab === 'media' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderBottom: activeTab === 'media' ? '2px solid var(--color-primary)' : '2px solid transparent'
          }}
        >
          Media ({mediaMessages.length})
        </button>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px' }}>
        {activeTab === 'details' && (
          <div>
            {/* Profile Avatar / Hero */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
              {conversation.type === 'dm' && dmUser ? (
                <div style={{ position: 'relative', width: '72px', height: '72px', marginBottom: '12px' }}>
                  <img
                    src={dmUser.avatar}
                    alt={dmUser.name}
                    style={{ width: '100%', height: '100%', borderRadius: '20px', objectFit: 'cover' }}
                  />
                  <span style={{ position: 'absolute', bottom: '0', right: '0' }}>
                    <StatusBadge status={dmUser.status} size={14} />
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    backgroundColor: 'var(--color-surface-container-high)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '12px'
                  }}
                >
                  {conversation.isPrivate ? <Lock size={28} /> : <Hash size={28} />}
                </div>
              )}

              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {conversation.type === 'dm' && dmUser ? dmUser.name : '#' + conversation.name}
              </h2>

              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {conversation.type === 'dm' && dmUser ? dmUser.role : conversation.topic}
              </p>
            </div>

            {/* Details List */}
            {conversation.type === 'dm' && dmUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Mail size={16} color="var(--color-text-muted)" />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{dmUser.email}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <Clock size={16} color="var(--color-text-muted)" />
                  <span style={{ color: 'var(--color-text-secondary)' }}>{dmUser.timezone}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                  <ShieldCheck size={16} color="#10b981" />
                  <span style={{ color: 'var(--color-text-secondary)' }}>Verified Team Member</span>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Members ({conversation.memberIds.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {conversation.memberIds.map((memberId) => {
                    const member = users.find((u) => u.id === memberId);
                    if (!member) return null;
                    return (
                      <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                          <img
                            src={member.avatar}
                            alt={member.name}
                            style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <span style={{ position: 'absolute', bottom: '-1px', right: '-1px' }}>
                            <StatusBadge status={member.status} size={7} />
                          </span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{member.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{member.role}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pinned' && (
          <div>
            {pinnedMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', padding: '30px 0' }}>
                No pinned messages in this channel yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pinnedMessages.map((pin) => (
                  <div
                    key={pin.id}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--color-surface-container)',
                      borderRadius: 'var(--md-shape-corner-md)',
                      border: '1px solid var(--color-outline)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--color-warning)', marginBottom: '4px' }}>
                      <Pin size={12} />
                      <span>Pinned</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-primary)' }}>{pin.text}</p>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', display: 'block' }}>
                      {new Date(pin.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div>
            {mediaMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px', padding: '30px 0' }}>
                No media or attachments shared yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {mediaMessages.flatMap((m) => m.attachments || []).map((att) => (
                  <div
                    key={att.id}
                    style={{
                      borderRadius: 'var(--md-shape-corner-sm)',
                      overflow: 'hidden',
                      border: '1px solid var(--color-outline)',
                      height: '90px'
                    }}
                  >
                    {att.type === 'image' ? (
                      <img src={att.url} alt={att.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'var(--color-surface-container)' }}>
                        <FileText size={20} color="var(--color-text-muted)" />
                        <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '4px', textAlign: 'center' }}>{att.name}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

import React, { useState } from 'react';
import { Conversation, User } from '../../types';
import { StatusBadge } from '../common/SvgIcons';
import { 
  Hash, 
  Search, 
  Plus, 
  Lock, 
  X, 
  ChevronDown, 
  ChevronRight,
  Radio
} from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  users: User[];
  activeUser: User;
  onOpenNewModal: () => void;
  filterTab: 'all' | 'channels' | 'dms';
  typingUsers: { [conversationId: string]: string[] };
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  users,
  activeUser,
  onOpenNewModal,
  filterTab,
  typingUsers
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelsCollapsed, setChannelsCollapsed] = useState(false);
  const [dmsCollapsed, setDmsCollapsed] = useState(false);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    // Tab filter
    if (filterTab === 'channels' && c.type !== 'channel') return false;
    if (filterTab === 'dms' && c.type !== 'dm') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = c.name.toLowerCase().includes(q);
      const topicMatch = c.topic?.toLowerCase().includes(q);
      return nameMatch || topicMatch;
    }
    return true;
  });

  const channelList = filteredConversations.filter((c) => c.type === 'channel');
  const dmList = filteredConversations.filter((c) => c.type === 'dm');

  // Helper to find the other user in a DM
  const getDmUser = (conv: Conversation): User | undefined => {
    const otherId = conv.memberIds.find((id) => id !== activeUser.id) || conv.memberIds[0];
    return users.find((u) => u.id === otherId);
  };

  return (
    <div className="sidebar-pane" aria-label="Conversations Sidebar">
      {/* Workspace Header */}
      <div
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--color-outline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
            Pulse Engineering
          </h2>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Radio size={11} color="#10b981" /> Production Cluster
          </span>
        </div>

        <button
          onClick={onOpenNewModal}
          className="icon-btn"
          style={{ width: '32px', height: '32px' }}
          title="Create Channel or Message"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Instant Search Bar */}
      <div style={{ padding: '12px 14px 8px 14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 10px',
            backgroundColor: 'var(--color-surface-container)',
            borderRadius: 'var(--md-shape-corner-md)',
            border: '1px solid var(--color-outline)'
          }}
        >
          <Search size={15} color="var(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search channels or people..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              fontSize: '13px',
              color: 'var(--color-text-primary)'
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{ display: 'flex', color: 'var(--color-text-muted)' }}>
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Conversation List Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0 16px 0' }}>
        {/* CHANNELS SECTION */}
        {(filterTab === 'all' || filterTab === 'channels') && (
          <div style={{ marginBottom: '14px' }}>
            <div
              onClick={() => setChannelsCollapsed(!channelsCollapsed)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 16px 4px 16px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {channelsCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                <span>Channels ({channelList.length})</span>
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNewModal();
                }}
                title="Add Channel"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Plus size={14} />
              </span>
            </div>

            {!channelsCollapsed &&
              channelList.map((channel) => {
                const isActive = channel.id === activeConversationId;
                const typing = typingUsers[channel.id];

                return (
                  <div
                    key={channel.id}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectConversation(channel.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <span style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                        {channel.isPrivate ? <Lock size={16} /> : <Hash size={16} />}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="conversation-name"
                          style={{
                            fontSize: '13.5px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {channel.name}
                        </div>
                        {typing && typing.length > 0 ? (
                          <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontStyle: 'italic' }}>
                            someone is typing...
                          </div>
                        ) : channel.lastMessage ? (
                          <div
                            style={{
                              fontSize: '11.5px',
                              color: 'var(--color-text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {channel.lastMessage.text}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {channel.unreadCount > 0 && (
                      <span className="pill-badge pill-badge-primary">
                        {channel.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        )}

        {/* DIRECT MESSAGES SECTION */}
        {(filterTab === 'all' || filterTab === 'dms') && (
          <div>
            <div
              onClick={() => setDmsCollapsed(!dmsCollapsed)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 16px 4px 16px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {dmsCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                <span>Direct Messages ({dmList.length})</span>
              </div>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNewModal();
                }}
                title="New Direct Message"
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <Plus size={14} />
              </span>
            </div>

            {!dmsCollapsed &&
              dmList.map((dm) => {
                const isActive = dm.id === activeConversationId;
                const dmUser = getDmUser(dm);
                const typing = typingUsers[dm.id];

                return (
                  <div
                    key={dm.id}
                    className={`conversation-item ${isActive ? 'active' : ''}`}
                    onClick={() => onSelectConversation(dm.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      {dmUser && (
                        <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                          <img
                            src={dmUser.avatar}
                            alt={dmUser.name}
                            style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <span style={{ position: 'absolute', bottom: '-1px', right: '-1px' }}>
                            <StatusBadge status={dmUser.status} size={8} />
                          </span>
                        </div>
                      )}

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="conversation-name"
                          style={{
                            fontSize: '13.5px',
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {dmUser ? dmUser.name : dm.name}
                        </div>
                        {typing && typing.length > 0 ? (
                          <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontStyle: 'italic' }}>
                            typing...
                          </div>
                        ) : dm.lastMessage ? (
                          <div
                            style={{
                              fontSize: '11.5px',
                              color: 'var(--color-text-muted)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          >
                            {dm.lastMessage.text}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {dm.unreadCount > 0 && (
                      <span className="pill-badge pill-badge-primary">
                        {dm.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};

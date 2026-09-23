import React, { useState, useEffect, useRef } from 'react';
import { User, Conversation, Message, SvgReactionId, MongoConfig, ReplyPreview } from './types';
import { StorageService } from './services/storage';
import { realtimeBus } from './services/broadcast';
import { MongoApiService } from './services/mongoApi';
import { ActivityRail } from './components/Sidebar/ActivityRail';
import { ConversationList } from './components/Sidebar/ConversationList';
import { ChatHeader } from './components/Chat/ChatHeader';
import { MessageList } from './components/Chat/MessageList';
import { MessageComposer } from './components/Chat/MessageComposer';
import { InfoDrawer } from './components/Drawer/InfoDrawer';
import { MongoConfigModal } from './components/Modals/MongoConfigModal';
import { NewConversationModal } from './components/Modals/NewConversationModal';
import { UserProfileModal } from './components/Modals/UserProfileModal';

export const App: React.FC = () => {
  // Initialize storage
  StorageService.initStorage();

  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [activeUserId, setActiveUserId] = useState<string>(StorageService.getActiveUserId());
  const [conversations, setConversations] = useState<Conversation[]>(StorageService.getConversations());
  const [activeConversationId, setActiveConversationId] = useState<string>('chan-general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [theme, setThemeState] = useState<'dark' | 'light'>(StorageService.getTheme());
  const [mongoConfig, setMongoConfig] = useState<MongoConfig>(StorageService.getMongoConfig());

  // UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [activeRailTab, setActiveRailTab] = useState<'all' | 'channels' | 'dms'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [replyTo, setReplyTo] = useState<ReplyPreview | null>(null);
  const [showMongoModal, setShowMongoModal] = useState<boolean>(false);
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [typingMap, setTypingMap] = useState<{ [conversationId: string]: string[] }>({});

  const activeUser = users.find((u) => u.id === activeUserId) || users[0];
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Set theme on html
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  // Load messages whenever active conversation changes
  useEffect(() => {
    if (activeConversation) {
      const msgs = StorageService.getMessages(activeConversation.id);
      setMessages(msgs);

      // Initial remote fetch if backend is connected
      MongoApiService.fetchRemoteMessages(activeConversation.id).then((remoteMsgs) => {
        if (remoteMsgs && remoteMsgs.length > 0) {
          setMessages(remoteMsgs);
          remoteMsgs.forEach((m) => StorageService.saveMessage(m));
        }
      });
    }
  }, [activeConversationId]);

  // Real-time Cloud Polling for Multi-Device People-to-People Chat
  useEffect(() => {
    if (!activeConversation) return;

    const interval = setInterval(async () => {
      try {
        const remoteMsgs = await MongoApiService.fetchRemoteMessages(activeConversation.id);
        if (remoteMsgs && remoteMsgs.length > 0) {
          setMessages((prev) => {
            // Check if there are any new messages
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = remoteMsgs.filter((m) => !existingIds.has(m.id));
            if (newOnes.length > 0) {
              newOnes.forEach((m) => StorageService.saveMessage(m));
              return [...prev, ...newOnes];
            }
            return prev;
          });
        }
      } catch {
        // Silently continue in offline mode
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [activeConversationId]);

  // Subscribe to real-time BroadcastChannel (for same-machine multi-tab)
  useEffect(() => {
    const unsubscribe = realtimeBus.subscribe((payload) => {
      if (payload.type === 'NEW_MESSAGE') {
        if (payload.message.conversationId === activeConversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.message.id)) return prev;
            return [...prev, payload.message];
          });
        }
        setConversations(StorageService.getConversations());
      } else if (payload.type === 'REACTION_UPDATED') {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === payload.messageId) {
              const updated = StorageService.getMessages(activeConversationId).find((x) => x.id === payload.messageId);
              return updated || m;
            }
            return m;
          })
        );
      } else if (payload.type === 'TYPING_STATUS') {
        setTypingMap((prev) => {
          const current = prev[payload.conversationId] || [];
          if (payload.isTyping) {
            if (!current.includes(payload.userId)) {
              return { ...prev, [payload.conversationId]: [...current, payload.userId] };
            }
          } else {
            return {
              ...prev,
              [payload.conversationId]: current.filter((id) => id !== payload.userId)
            };
          }
          return prev;
        });
      } else if (payload.type === 'MESSAGE_PINNED' || payload.type === 'MESSAGE_DELETED') {
        setMessages(StorageService.getMessages(activeConversationId));
      }
    });

    return () => unsubscribe();
  }, [activeConversationId]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMongoModal(false);
        setShowNewModal(false);
        setShowProfileModal(false);
        setReplyTo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    StorageService.setTheme(nextTheme);
    setThemeState(nextTheme);
  };

  const handleSelectUser = (user: User) => {
    StorageService.setActiveUserId(user.id);
    setActiveUserId(user.id);
  };

  const handleSaveProfile = (updatedUser: User) => {
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    localStorage.setItem('pulsechat_users_v1', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    // Save to remote cloud database
    MongoApiService.saveRemoteUser(updatedUser);
  };

  const handleSendMessage = async (text: string, attachments?: any[]) => {
    if (!activeConversation) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      conversationId: activeConversation.id,
      senderId: activeUser.id,
      text,
      timestamp: Date.now(),
      status: 'sent',
      reactions: [],
      attachments,
      replyTo: replyTo || undefined
    };

    // Save locally
    StorageService.saveMessage(newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setConversations(StorageService.getConversations());
    setReplyTo(null);

    // Broadcast across tabs on the same machine
    realtimeBus.broadcast({ type: 'NEW_MESSAGE', message: newMessage });

    // Send to central cloud MongoDB Atlas database for other real people to receive!
    MongoApiService.sendRemoteMessage(newMessage);
  };

  const handleToggleReaction = async (messageId: string, reactionId: SvgReactionId) => {
    const updated = StorageService.toggleReaction(messageId, reactionId, activeUser.id);
    realtimeBus.broadcast({
      type: 'REACTION_UPDATED',
      messageId,
      reactionId,
      userId: activeUser.id
    });

    if (updated) {
      MongoApiService.updateRemoteMessage(messageId, { reactions: updated.reactions });
    }
  };

  const handleTogglePin = (messageId: string) => {
    const updated = StorageService.togglePinMessage(messageId);
    if (updated) {
      realtimeBus.broadcast({
        type: 'MESSAGE_PINNED',
        messageId,
        isPinned: !!updated.isPinned
      });
      MongoApiService.updateRemoteMessage(messageId, { isPinned: !!updated.isPinned });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    StorageService.deleteMessage(messageId);
    realtimeBus.broadcast({
      type: 'MESSAGE_DELETED',
      messageId
    });
    MongoApiService.deleteRemoteMessage(messageId);
  };

  const handleTyping = (isTyping: boolean) => {
    if (!activeConversation) return;
    realtimeBus.broadcast({
      type: 'TYPING_STATUS',
      conversationId: activeConversation.id,
      userId: activeUser.id,
      isTyping
    });
  };

  const handleCreateChannel = (name: string, topic: string, isPrivate: boolean) => {
    const newChan: Conversation = {
      id: `chan-${name}`,
      type: 'channel',
      name,
      topic,
      isPrivate,
      unreadCount: 0,
      memberIds: users.map((u) => u.id)
    };

    const updated = [...conversations, newChan];
    localStorage.setItem('pulsechat_conversations_v1', JSON.stringify(updated));
    setConversations(updated);
    setActiveConversationId(newChan.id);
  };

  const handleStartDm = (targetUserId: string) => {
    const targetUser = users.find((u) => u.id === targetUserId);
    if (!targetUser) return;

    const existing = conversations.find(
      (c) => c.type === 'dm' && c.memberIds.includes(targetUserId) && c.memberIds.includes(activeUser.id)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      return;
    }

    const newDm: Conversation = {
      id: `dm-${targetUser.username.replace(/[^a-z0-9]/g, '')}`,
      type: 'dm',
      name: targetUser.name,
      topic: 'Direct Message',
      unreadCount: 0,
      memberIds: [activeUser.id, targetUserId]
    };

    const updated = [...conversations, newDm];
    localStorage.setItem('pulsechat_conversations_v1', JSON.stringify(updated));
    setConversations(updated);
    setActiveConversationId(newDm.id);
  };

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);
  const currentTypingUsers = (activeConversation ? typingMap[activeConversation.id] : []) || [];
  const currentTypingPeers = currentTypingUsers.filter((id) => id !== activeUser.id);
  const pinnedCount = messages.filter((m) => m.isPinned).length;

  return (
    <div className="app-container">
      {/* Activity Rail */}
      <ActivityRail
        users={users}
        activeUser={activeUser}
        onSelectUser={handleSelectUser}
        mongoConfig={mongoConfig}
        onOpenMongoModal={() => setShowMongoModal(true)}
        onOpenProfileModal={() => setShowProfileModal(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        activeTab={activeRailTab}
        onSelectTab={setActiveRailTab}
        unreadCount={totalUnread}
      />

      {/* Conversations Sidebar */}
      <ConversationList
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        users={users}
        activeUser={activeUser}
        onOpenNewModal={() => setShowNewModal(true)}
        filterTab={activeRailTab}
        typingUsers={typingMap}
      />

      {/* Main Chat Pane */}
      <main className="main-chat-pane">
        {activeConversation ? (
          <>
            <ChatHeader
              conversation={activeConversation}
              activeUser={activeUser}
              users={users}
              isDrawerOpen={isDrawerOpen}
              onToggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
              onToggleSearch={() => setSearchFilter(searchFilter ? '' : ' ')}
              onTogglePinned={() => setIsDrawerOpen(true)}
              pinnedCount={pinnedCount}
            />

            {/* In-chat search banner */}
            {searchFilter !== '' && (
              <div
                style={{
                  padding: '8px 20px',
                  backgroundColor: 'var(--color-surface-container)',
                  borderBottom: '1px solid var(--color-outline)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <input
                  type="text"
                  placeholder="Filter messages in this conversation..."
                  value={searchFilter.trim()}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  autoFocus
                  style={{ flex: 1, fontSize: '13px', color: 'var(--color-text-primary)' }}
                />
                <button
                  onClick={() => setSearchFilter('')}
                  style={{ fontSize: '12px', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            )}

            <MessageList
              messages={messages}
              users={users}
              activeUserId={activeUser.id}
              typingUsers={currentTypingPeers}
              searchFilter={searchFilter.trim()}
              onToggleReaction={handleToggleReaction}
              onReply={(m) => {
                const senderName = users.find((u) => u.id === m.senderId)?.name || 'User';
                setReplyTo({ id: m.id, senderName, textSnippet: m.text.slice(0, 60) });
              }}
              onTogglePin={handleTogglePin}
              onDelete={handleDeleteMessage}
            />

            <MessageComposer
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              activeConversationName={activeConversation.type === 'dm' ? activeConversation.name : '#' + activeConversation.name}
            />
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
            Select a channel or direct message to begin.
          </div>
        )}
      </main>

      {/* Right Details Drawer */}
      {isDrawerOpen && activeConversation && (
        <InfoDrawer
          conversation={activeConversation}
          activeUser={activeUser}
          users={users}
          messages={messages}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      {/* MongoDB Atlas Modal */}
      {showMongoModal && (
        <MongoConfigModal
          config={mongoConfig}
          onSave={(cfg) => {
            StorageService.saveMongoConfig(cfg);
            setMongoConfig(cfg);
          }}
          onClose={() => setShowMongoModal(false)}
        />
      )}

      {/* New Conversation Modal */}
      {showNewModal && (
        <NewConversationModal
          users={users}
          activeUser={activeUser}
          existingConversations={conversations}
          onClose={() => setShowNewModal(false)}
          onCreateChannel={handleCreateChannel}
          onStartDm={handleStartDm}
        />
      )}

      {/* Real User Profile Modal */}
      {showProfileModal && (
        <UserProfileModal
          currentUser={activeUser}
          onSave={handleSaveProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

export default App;

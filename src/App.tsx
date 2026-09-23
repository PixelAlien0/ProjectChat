import React, { useState, useEffect, useRef } from 'react';
import { User, Conversation, Message, SvgReactionId, MongoConfig, ReplyPreview } from './types';
import { StorageService } from './services/storage';
import { realtimeBus } from './services/broadcast';
import { ActivityRail } from './components/Sidebar/ActivityRail';
import { ConversationList } from './components/Sidebar/ConversationList';
import { ChatHeader } from './components/Chat/ChatHeader';
import { MessageList } from './components/Chat/MessageList';
import { MessageComposer } from './components/Chat/MessageComposer';
import { InfoDrawer } from './components/Drawer/InfoDrawer';
import { MongoConfigModal } from './components/Modals/MongoConfigModal';
import { NewConversationModal } from './components/Modals/NewConversationModal';

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
    }
  }, [activeConversationId]);

  // Subscribe to real-time BroadcastChannel
  useEffect(() => {
    const unsubscribe = realtimeBus.subscribe((payload) => {
      if (payload.type === 'NEW_MESSAGE') {
        // Update messages if currently viewed
        if (payload.message.conversationId === activeConversationId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.message.id)) return prev;
            return [...prev, payload.message];
          });
        }
        // Update conversation lastMessage
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

  const handleSendMessage = (text: string, attachments?: any[]) => {
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

    StorageService.saveMessage(newMessage);
    setMessages((prev) => [...prev, newMessage]);
    setConversations(StorageService.getConversations());
    setReplyTo(null);

    // Broadcast in real-time to other tabs
    realtimeBus.broadcast({ type: 'NEW_MESSAGE', message: newMessage });

    // Optional realistic peer response simulation
    simulatePeerResponse(activeConversation, newMessage);
  };

  const simulatePeerResponse = (conv: Conversation, userMsg: Message) => {
    // Only simulate if user sends a message in a channel or DM
    const potentialSenders = conv.memberIds.filter((id) => id !== activeUser.id);
    if (potentialSenders.length === 0) return;

    const peerId = potentialSenders[0];
    const peerUser = users.find((u) => u.id === peerId);

    // Realistic simulation after 1.8 seconds
    setTimeout(() => {
      // 50% chance peer adds an SVG reaction to the user's message
      if (Math.random() > 0.4) {
        const reactions: SvgReactionId[] = ['thumbs_up', 'rocket', 'check', 'fire', 'sparkle'];
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];
        StorageService.toggleReaction(userMsg.id, randomReaction, peerId);
        realtimeBus.broadcast({
          type: 'REACTION_UPDATED',
          messageId: userMsg.id,
          reactionId: randomReaction,
          userId: peerId
        });
      }

      // If DM or specific channels, peer sends a thoughtful reply
      if (conv.type === 'dm' || Math.random() > 0.6) {
        // Show typing indicator for 1 second first
        realtimeBus.broadcast({
          type: 'TYPING_STATUS',
          conversationId: conv.id,
          userId: peerId,
          isTyping: true
        });

        setTimeout(() => {
          realtimeBus.broadcast({
            type: 'TYPING_STATUS',
            conversationId: conv.id,
            userId: peerId,
            isTyping: false
          });

          const responses = [
            `Reviewed! The changes align with our Material 3 design spec.`,
            `Sounds great. The MongoDB Atlas collection index has finished rebuilding.`,
            `Checked on local dev and preview deployment. Zero layout shifts and GSAP curves look crisp!`,
            `Agreed! Let's deploy this build to Vercel.`
          ];
          const responseText = responses[Math.floor(Math.random() * responses.length)];

          const peerMsg: Message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            conversationId: conv.id,
            senderId: peerId,
            text: responseText,
            timestamp: Date.now(),
            status: 'delivered',
            reactions: []
          };

          StorageService.saveMessage(peerMsg);
          realtimeBus.broadcast({ type: 'NEW_MESSAGE', message: peerMsg });
        }, 1200);
      }
    }, 1800);
  };

  const handleToggleReaction = (messageId: string, reactionId: SvgReactionId) => {
    StorageService.toggleReaction(messageId, reactionId, activeUser.id);
    realtimeBus.broadcast({
      type: 'REACTION_UPDATED',
      messageId,
      reactionId,
      userId: activeUser.id
    });
  };

  const handleTogglePin = (messageId: string) => {
    const updated = StorageService.togglePinMessage(messageId);
    if (updated) {
      realtimeBus.broadcast({
        type: 'MESSAGE_PINNED',
        messageId,
        isPinned: !!updated.isPinned
      });
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    StorageService.deleteMessage(messageId);
    realtimeBus.broadcast({
      type: 'MESSAGE_DELETED',
      messageId
    });
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

    // Check if DM conversation already exists
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

            {/* In-chat search banner if active */}
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
    </div>
  );
};

export default App;

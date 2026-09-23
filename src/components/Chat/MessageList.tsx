import React, { useEffect, useRef } from 'react';
import { Message, User, SvgReactionId } from '../../types';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: Message[];
  users: User[];
  activeUserId: string;
  typingUsers: string[];
  searchFilter: string;
  onToggleReaction: (messageId: string, reactionId: SvgReactionId) => void;
  onReply: (message: Message) => void;
  onTogglePin: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  users,
  activeUserId,
  typingUsers,
  searchFilter,
  onToggleReaction,
  onReply,
  onTogglePin,
  onDelete
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Filter messages if search is active
  const displayedMessages = searchFilter.trim()
    ? messages.filter((m) => m.text.toLowerCase().includes(searchFilter.toLowerCase()))
    : messages;

  // Format date header string
  const formatDateDivider = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Grouping helpers
  const userMap = new Map<string, User>(users.map((u) => [u.id, u]));

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '12px 0'
      }}
      aria-label="Message Feed"
    >
      {displayedMessages.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            fontSize: '14px',
            gap: '8px'
          }}
        >
          <span>No messages yet.</span>
          <span style={{ fontSize: '12px' }}>Start the conversation below!</span>
        </div>
      ) : (
        displayedMessages.map((msg, index) => {
          const prevMsg = displayedMessages[index - 1];
          const sender = userMap.get(msg.senderId);
          const isCurrentUser = msg.senderId === activeUserId;

          // Check if date divider is needed
          const showDateDivider =
            !prevMsg ||
            new Date(prevMsg.timestamp).toDateString() !== new Date(msg.timestamp).toDateString();

          // Check if first in group (same sender and within 5 minutes)
          const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;
          const isWithinFiveMinutes = prevMsg && msg.timestamp - prevMsg.timestamp < 1000 * 60 * 5;
          const isFirstInGroup = showDateDivider || !isSameSender || !isWithinFiveMinutes;

          return (
            <React.Fragment key={msg.id}>
              {showDateDivider && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    margin: '16px 24px',
                    position: 'relative'
                  }}
                >
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline)' }} />
                  <span
                    style={{
                      padding: '2px 12px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      backgroundColor: 'var(--color-surface-container)',
                      borderRadius: 'var(--md-shape-corner-full)',
                      border: '1px solid var(--color-outline)'
                    }}
                  >
                    {formatDateDivider(msg.timestamp)}
                  </span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-outline)' }} />
                </div>
              )}

              <MessageItem
                message={msg}
                sender={sender}
                isCurrentUser={isCurrentUser}
                activeUserId={activeUserId}
                isFirstInGroup={isFirstInGroup}
                onToggleReaction={onToggleReaction}
                onReply={onReply}
                onTogglePin={onTogglePin}
                onDelete={onDelete}
              />
            </React.Fragment>
          );
        })
      )}

      {/* Typing Indicator Bar */}
      {typingUsers.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 24px',
            fontSize: '12px',
            color: 'var(--color-text-muted)'
          }}
        >
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: 'var(--color-primary)',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'bounce 1s infinite alternate'
              }}
            />
            <span
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: 'var(--color-primary)',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'bounce 1s infinite alternate 0.2s'
              }}
            />
            <span
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: 'var(--color-primary)',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'bounce 1s infinite alternate 0.4s'
              }}
            />
          </div>
          <span>
            {typingUsers.map((id) => userMap.get(id)?.name || 'Someone').join(', ')}{' '}
            {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      <div ref={bottomRef} style={{ height: '4px' }} />
    </div>
  );
};

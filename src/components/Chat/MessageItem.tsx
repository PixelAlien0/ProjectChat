import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { Message, User, SvgReactionId } from '../../types';
import { 
  SvgReaction, 
  REACTION_DEFINITIONS, 
  MessageDeliveryStatus 
} from '../common/SvgIcons';
import { 
  Smile, 
  Reply, 
  Pin, 
  Copy, 
  Trash2, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  sender: User | undefined;
  isCurrentUser: boolean;
  activeUserId: string;
  isFirstInGroup: boolean;
  onToggleReaction: (messageId: string, reactionId: SvgReactionId) => void;
  onReply: (message: Message) => void;
  onTogglePin: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  sender,
  isCurrentUser,
  activeUserId,
  isFirstInGroup,
  onToggleReaction,
  onReply,
  onTogglePin,
  onDelete
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  // GSAP Entrance Animation
  useEffect(() => {
    if (itemRef.current) {
      gsap.fromTo(
        itemRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.24, ease: 'power2.out' }
      );
    }
  }, []);

  // Format time
  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReactionClick = (reactionId: SvgReactionId, e: React.MouseEvent) => {
    // Subtle bounce on reaction pill
    const target = e.currentTarget as HTMLElement;
    gsap.fromTo(
      target,
      { scale: 0.85 },
      { scale: 1, duration: 0.3, ease: 'back.out(2)' }
    );
    onToggleReaction(message.id, reactionId);
  };

  // Simple Markdown renderer
  const renderFormattedText = (text: string) => {
    // Check for code blocks
    if (text.includes('```')) {
      const parts = text.split(/(```[\s\S]*?```)/g);
      return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const content = part.slice(3, -3).replace(/^[a-z]+\n/, ''); // remove language identifier if any
          return (
            <pre key={index}>
              <code>{content.trim()}</code>
            </pre>
          );
        }
        return renderInlineFormatting(part, index);
      });
    }
    return renderInlineFormatting(text, 0);
  };

  const renderInlineFormatting = (text: string, keyPrefix: number) => {
    // Handle inline code: `code`
    const codeParts = text.split(/(`[^`]+`)/g);
    return (
      <span key={keyPrefix}>
        {codeParts.map((part, idx) => {
          if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={idx}>{part.slice(1, -1)}</code>;
          }
          // Handle bold **text**
          const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
          return boldParts.map((bPart, bIdx) => {
            if (bPart.startsWith('**') && bPart.endsWith('**')) {
              return <strong key={bIdx}>{bPart.slice(2, -2)}</strong>;
            }
            // Handle italics *text*
            const italicParts = bPart.split(/(\*[^*]+\*)/g);
            return italicParts.map((iPart, iIdx) => {
              if (iPart.startsWith('*') && iPart.endsWith('*')) {
                return <em key={iIdx}>{iPart.slice(1, -1)}</em>;
              }
              return iPart;
            });
          });
        })}
      </span>
    );
  };

  return (
    <div
      ref={itemRef}
      className="message-group"
      style={{
        paddingTop: isFirstInGroup ? '12px' : '4px',
        paddingBottom: '4px',
        position: 'relative'
      }}
    >
      {/* Avatar (visible only for first message in group) */}
      <div className="message-avatar-wrap">
        {isFirstInGroup && sender && (
          <img src={sender.avatar} alt={sender.name} className="message-avatar" />
        )}
      </div>

      {/* Message Column */}
      <div className="message-content-col">
        {/* Reply Quote Banner if replying */}
        {message.replyTo && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11.5px',
              color: 'var(--color-text-muted)',
              marginBottom: '4px',
              paddingLeft: '6px',
              borderLeft: '2px solid var(--color-primary)'
            }}
          >
            <Reply size={12} color="var(--color-primary)" />
            <span>
              Replying to <strong style={{ color: 'var(--color-text-secondary)' }}>{message.replyTo.senderName}</strong>:{' '}
              {message.replyTo.textSnippet}
            </span>
          </div>
        )}

        {/* Header: Author & Time */}
        {isFirstInGroup && (
          <div className="message-header">
            <span className="message-author">{sender ? sender.name : 'Unknown User'}</span>
            {sender?.role && <span className="message-role">{sender.role}</span>}
            <span className="message-time">{timeString}</span>
            {message.isPinned && (
              <span
                title="Pinned message"
                style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-warning)' }}
              >
                <Pin size={12} />
              </span>
            )}
          </div>
        )}

        {/* Message Text */}
        <div className="message-text">
          {renderFormattedText(message.text)}
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {message.attachments.map((att) => (
              <div
                key={att.id}
                style={{
                  borderRadius: 'var(--md-shape-corner-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-outline)',
                  maxWidth: '320px'
                }}
              >
                {att.type === 'image' ? (
                  <img
                    src={att.url}
                    alt={att.name}
                    style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{ padding: '10px 14px', backgroundColor: 'var(--color-surface-container)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>{att.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{att.size}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Vector SVG Reaction Pills */}
        {message.reactions && message.reactions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', marginTop: '4px' }}>
            {message.reactions.map((r) => {
              const hasReacted = r.userIds.includes(activeUserId);
              return (
                <button
                  key={r.reactionId}
                  className={`reaction-pill ${hasReacted ? 'user-reacted' : ''}`}
                  onClick={(e) => handleReactionClick(r.reactionId, e)}
                  title={`${r.label} (${r.count})`}
                >
                  <SvgReaction id={r.reactionId} size={15} />
                  <span>{r.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Message Delivery Status Indicator for Current User */}
        {isCurrentUser && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px', color: 'var(--color-text-muted)' }}>
            <MessageDeliveryStatus status={message.status} />
          </div>
        )}
      </div>

      {/* Hover Action Toolbar */}
      <div className="message-action-toolbar">
        {/* SVG Reaction Popover Button */}
        <div style={{ position: 'relative' }}>
          <button
            className="action-bar-btn"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            title="Add SVG Reaction"
          >
            <Smile size={16} />
          </button>

          {/* Curated SVG Vector Reaction Picker */}
          {showReactionPicker && (
            <div
              style={{
                position: 'absolute',
                top: '-48px',
                right: '0',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 6px',
                backgroundColor: 'var(--color-surface-container-high)',
                border: '1px solid var(--color-outline)',
                borderRadius: 'var(--md-shape-corner-full)',
                boxShadow: 'var(--elevation-3)',
                zIndex: 20,
                animation: 'modalIn 140ms ease'
              }}
            >
              {REACTION_DEFINITIONS.map((def) => (
                <button
                  key={def.id}
                  onClick={(e) => {
                    handleReactionClick(def.id, e);
                    setShowReactionPicker(false);
                  }}
                  title={def.label}
                  style={{
                    padding: '6px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: def.color,
                    transition: 'transform 120ms ease, background-color 120ms ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container-highest)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <SvgReaction id={def.id} size={18} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply in thread */}
        <button
          className="action-bar-btn"
          onClick={() => onReply(message)}
          title="Reply"
        >
          <Reply size={15} />
        </button>

        {/* Pin Message */}
        <button
          className="action-bar-btn"
          onClick={() => onTogglePin(message.id)}
          title={message.isPinned ? 'Unpin message' : 'Pin message'}
        >
          <Pin size={15} color={message.isPinned ? 'var(--color-warning)' : 'inherit'} />
        </button>

        {/* Copy text */}
        <button
          className="action-bar-btn"
          onClick={handleCopy}
          title={copied ? 'Copied!' : 'Copy message text'}
        >
          {copied ? <Check size={15} color="#10b981" /> : <Copy size={15} />}
        </button>

        {/* Delete (if user is sender) */}
        {isCurrentUser && (
          <button
            className="action-bar-btn"
            onClick={() => onDelete(message.id)}
            title="Delete message"
          >
            <Trash2 size={15} color="#ef4444" />
          </button>
        )}
      </div>
    </div>
  );
};

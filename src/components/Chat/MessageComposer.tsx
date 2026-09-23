import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ReplyPreview, SvgReactionId } from '../../types';
import { 
  SvgReaction, 
  REACTION_DEFINITIONS 
} from '../common/SvgIcons';
import { 
  Bold, 
  Italic, 
  Code, 
  Quote, 
  Paperclip, 
  Smile, 
  Send, 
  X, 
  Image as ImageIcon 
} from 'lucide-react';

interface MessageComposerProps {
  onSendMessage: (text: string, attachments?: any[]) => void;
  onTyping: (isTyping: boolean) => void;
  replyTo: ReplyPreview | null;
  onCancelReply: () => void;
  activeConversationName: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onTyping,
  replyTo,
  onCancelReply,
  activeConversationName
}) => {
  const [text, setText] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [attachments, setAttachments] = useState<any[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sendBtnRef = useRef<HTMLButtonElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);

    // Notify typing
    onTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() && attachments.length === 0) return;

    // GSAP spring animation on send button
    if (sendBtnRef.current) {
      gsap.timeline()
        .to(sendBtnRef.current, { scale: 0.9, duration: 0.1 })
        .to(sendBtnRef.current, { scale: 1.05, duration: 0.15, ease: 'back.out(2)' })
        .to(sendBtnRef.current, { scale: 1, duration: 0.1 });
    }

    onSendMessage(text.trim(), attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments([]);
    onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  // Insert formatting markdown around selection
  const applyFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = text.slice(start, end);
    const newText = text.slice(0, start) + prefix + (selected || 'text') + suffix + text.slice(end);
    setText(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + prefix.length, end + prefix.length);
      }
    }, 0);
  };

  const handleAddSampleImage = () => {
    setAttachments([
      ...attachments,
      {
        id: `att-${Date.now()}`,
        type: 'image',
        name: 'Design-System-Spec.png',
        size: '1.2 MB',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80'
      }
    ]);
  };

  const insertReactionGlyph = (reactionId: SvgReactionId) => {
    // Append reaction shortcut or descriptor
    const def = REACTION_DEFINITIONS.find((d) => d.id === reactionId);
    if (def) {
      setText((prev) => (prev ? `${prev} [${def.label}]` : `[${def.label}]`));
    }
    setShowReactionPicker(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="composer-container" aria-label="Message Composer">
      <div className="composer-box">
        {/* Reply Preview Bar */}
        {replyTo && (
          <div
            style={{
              padding: '8px 14px',
              backgroundColor: 'var(--color-surface-container-high)',
              borderBottom: '1px solid var(--color-outline-variant)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                Replying to {replyTo.senderName}:
              </span>
              <span
                style={{
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {replyTo.textSnippet}
              </span>
            </div>
            <button
              onClick={onCancelReply}
              style={{ color: 'var(--color-text-muted)', display: 'flex' }}
              title="Cancel reply"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              padding: '10px 14px',
              backgroundColor: 'var(--color-surface-container-lowest)',
              borderBottom: '1px solid var(--color-outline-variant)'
            }}
          >
            {attachments.map((att, idx) => (
              <div
                key={att.id}
                style={{
                  position: 'relative',
                  width: '64px',
                  height: '64px',
                  borderRadius: 'var(--md-shape-corner-sm)',
                  overflow: 'hidden',
                  border: '1px solid var(--color-outline)'
                }}
              >
                <img src={att.url} alt={att.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Remove attachment"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Formatting Toolbar */}
        <div className="composer-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <button
              className="action-bar-btn"
              onClick={() => applyFormatting('**')}
              title="Bold (Ctrl+B)"
            >
              <Bold size={15} />
            </button>

            <button
              className="action-bar-btn"
              onClick={() => applyFormatting('*')}
              title="Italic (Ctrl+I)"
            >
              <Italic size={15} />
            </button>

            <button
              className="action-bar-btn"
              onClick={() => applyFormatting('`')}
              title="Inline Code"
            >
              <Code size={15} />
            </button>

            <button
              className="action-bar-btn"
              onClick={() => applyFormatting('> ')}
              title="Quote"
            >
              <Quote size={15} />
            </button>

            <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-outline)', margin: '0 4px' }} />

            <button
              className="action-bar-btn"
              onClick={handleAddSampleImage}
              title="Attach Media / Image"
            >
              <ImageIcon size={15} />
            </button>
          </div>

          <span style={{ fontSize: '11px', color: 'var(--color-text-dim)' }}>
            Markdown supported
          </span>
        </div>

        {/* Text Input Area */}
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          rows={1}
          placeholder={`Message ${activeConversationName}... (Press Enter to send, Shift+Enter for new line)`}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
        />

        {/* Bottom Actions: Vector Reaction Popover & Send Button */}
        <div className="composer-actions">
          <div style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              style={{ width: '32px', height: '32px' }}
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              title="Insert SVG Vector Reaction"
            >
              <Smile size={18} />
            </button>

            {/* SVG Vector Picker Popover */}
            {showReactionPicker && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  left: '0',
                  width: '240px',
                  backgroundColor: 'var(--color-surface-container-high)',
                  border: '1px solid var(--color-outline)',
                  borderRadius: 'var(--md-shape-corner-lg)',
                  boxShadow: 'var(--elevation-3)',
                  padding: '10px',
                  zIndex: 30,
                  animation: 'modalIn 140ms ease'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  SVG Vector Reactions
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {REACTION_DEFINITIONS.map((def) => (
                    <button
                      key={def.id}
                      onClick={() => insertReactionGlyph(def.id)}
                      title={def.label}
                      style={{
                        padding: '8px',
                        borderRadius: 'var(--md-shape-corner-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: def.color,
                        transition: 'background-color 120ms ease, transform 120ms ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-container-highest)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <SvgReaction id={def.id} size={20} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            ref={sendBtnRef}
            className="send-btn"
            onClick={handleSend}
            disabled={!text.trim() && attachments.length === 0}
            style={{
              opacity: text.trim() || attachments.length > 0 ? 1 : 0.5,
              cursor: text.trim() || attachments.length > 0 ? 'pointer' : 'default'
            }}
          >
            <span>Send</span>
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

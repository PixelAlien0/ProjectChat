import React from 'react';
import { SvgReactionId, UserStatus } from '../../types';

interface SvgReactionProps {
  id: SvgReactionId;
  size?: number;
  className?: string;
}

export const REACTION_DEFINITIONS: { id: SvgReactionId; label: string; color: string }[] = [
  { id: 'thumbs_up', label: 'Approve', color: '#6366f1' },
  { id: 'heart', label: 'Love', color: '#ec4899' },
  { id: 'fire', label: 'Fire', color: '#f97316' },
  { id: 'rocket', label: 'Ship it', color: '#8b5cf6' },
  { id: 'sparkle', label: 'Brilliant', color: '#eab308' },
  { id: 'check', label: 'Done', color: '#10b981' },
  { id: 'smile', label: 'Agree', color: '#06b6d4' },
  { id: 'party', label: 'Celebrate', color: '#f43f5e' },
  { id: 'eyes', label: 'Watching', color: '#64748b' },
  { id: 'star', label: 'Favorite', color: '#f59e0b' },
];

export const SvgReaction: React.FC<SvgReactionProps> = ({ id, size = 18, className = '' }) => {
  switch (id) {
    case 'thumbs_up':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M7 10v12" />
          <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h3" />
        </svg>
      );

    case 'heart':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );

    case 'fire':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M12 23c4.97 0 9-4.03 9-9 0-4.07-3.04-7.44-7.06-8.72l-.94-.3V3c-3 2.5-6 6.5-6 11 0 4.97 4.03 9 9 9zm0-15.5c2.61 2.22 4.5 5.2 4.5 7.5 0 2.48-2.02 4.5-4.5 4.5S7.5 17.48 7.5 15c0-2.3 1.89-5.28 4.5-7.5z" />
        </svg>
      );

    case 'rocket':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      );

    case 'sparkle':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" />
        </svg>
      );

    case 'check':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );

    case 'smile':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
          <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
        </svg>
      );

    case 'party':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="m4 11 16-7-7 16-3-6-6-3Z" />
          <path d="m14 10 3 3" />
          <path d="M2 2l3 3" />
          <path d="M22 22l-3-3" />
        </svg>
      );

    case 'eyes':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <circle cx="7" cy="12" r="5" />
          <circle cx="17" cy="12" r="5" />
          <circle cx="7" cy="12" r="2" fill="currentColor" />
          <circle cx="17" cy="12" r="2" fill="currentColor" />
        </svg>
      );

    case 'star':
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );

    default:
      return null;
  }
};

export const StatusBadge: React.FC<{ status: UserStatus; size?: number }> = ({ status, size = 10 }) => {
  const getColors = () => {
    switch (status) {
      case 'online':
        return { bg: '#10b981', ring: 'rgba(16, 185, 129, 0.25)', label: 'Online' };
      case 'busy':
        return { bg: '#ef4444', ring: 'rgba(239, 68, 68, 0.25)', label: 'Do not disturb' };
      case 'away':
        return { bg: '#f59e0b', ring: 'rgba(245, 158, 11, 0.25)', label: 'Away' };
      case 'offline':
      default:
        return { bg: '#94a3b8', ring: 'rgba(148, 163, 184, 0.25)', label: 'Offline' };
    }
  };

  const { bg, ring, label } = getColors();

  return (
    <span
      title={label}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bg,
        boxShadow: `0 0 0 2px var(--color-surface), 0 0 0 4px ${ring}`,
        borderRadius: '50%',
        display: 'inline-block',
        flexShrink: 0
      }}
    />
  );
};

export const MessageDeliveryStatus: React.FC<{ status: 'sent' | 'delivered' | 'read' }> = ({ status }) => {
  if (status === 'sent') {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <title>Sent</title>
        <polyline points="20 6 9 17 4 12" />
      </svg>
    );
  }
  if (status === 'delivered') {
    return (
      <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <title>Delivered</title>
        <path d="M18 6L7 17l-5-5" />
        <path d="M22 10l-7.5 7.5-2.5-2.5" />
      </svg>
    );
  }
  // read
  return (
    <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <title>Read</title>
      <path d="M18 6L7 17l-5-5" />
      <path d="M22 10l-7.5 7.5-2.5-2.5" />
    </svg>
  );
};

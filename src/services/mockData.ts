import { User, Conversation, Message } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-alex',
    name: 'Alex Rivera',
    username: 'alex.rivera',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'Staff Systems Architect',
    status: 'online',
    statusMessage: 'Refactoring database query planner',
    email: 'alex.rivera@pulsechat.internal',
    timezone: 'UTC-7 (San Francisco)'
  },
  {
    id: 'user-sarah',
    name: 'Sarah Chen',
    username: 'sarah.design',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Principal Design Lead',
    status: 'online',
    statusMessage: 'Finalizing Material 3 token taxonomy',
    email: 'sarah.chen@pulsechat.internal',
    timezone: 'UTC-8 (Seattle)'
  },
  {
    id: 'user-maya',
    name: 'Maya Lin',
    username: 'maya.lin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Director of Engineering',
    status: 'away',
    statusMessage: 'Quarterly roadmap sync',
    email: 'maya.lin@pulsechat.internal',
    timezone: 'UTC-5 (New York)'
  },
  {
    id: 'user-david',
    name: 'David Kim',
    username: 'david.devops',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'Platform & DevOps Lead',
    status: 'busy',
    statusMessage: 'Monitoring Vercel Edge compute latencies',
    email: 'david.kim@pulsechat.internal',
    timezone: 'UTC+9 (Seoul)'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'chan-general',
    type: 'channel',
    name: 'general',
    topic: 'Company-wide updates, discussions, and sprint kickoffs',
    unreadCount: 0,
    isPrivate: false,
    memberIds: ['user-alex', 'user-sarah', 'user-maya', 'user-david'],
    lastMessage: {
      senderId: 'user-maya',
      text: 'Sprint 24 review is scheduled for 3:00 PM UTC.',
      timestamp: Date.now() - 1000 * 60 * 18
    }
  },
  {
    id: 'chan-design-system',
    type: 'channel',
    name: 'design-system',
    topic: 'Material 3 design token definitions, SVG icon sets, and micro-interactions',
    unreadCount: 2,
    isPrivate: false,
    memberIds: ['user-alex', 'user-sarah', 'user-maya'],
    lastMessage: {
      senderId: 'user-sarah',
      text: 'The SVG reaction set is finalized with uniform 24px stroke coordinates.',
      timestamp: Date.now() - 1000 * 60 * 4
    }
  },
  {
    id: 'chan-engineering',
    type: 'channel',
    name: 'engineering',
    topic: 'Backend services, MongoDB Atlas clusters, and Vercel edge endpoints',
    unreadCount: 0,
    isPrivate: false,
    memberIds: ['user-alex', 'user-david', 'user-maya'],
    lastMessage: {
      senderId: 'user-david',
      text: 'MongoDB connection pooling index added on `timestamp_desc`.',
      timestamp: Date.now() - 1000 * 60 * 45
    }
  },
  {
    id: 'dm-sarah',
    type: 'dm',
    name: 'Sarah Chen',
    topic: 'Direct Message',
    unreadCount: 1,
    memberIds: ['user-alex', 'user-sarah'],
    lastMessage: {
      senderId: 'user-sarah',
      text: 'Could you review the GSAP timeline ease curve for the message bubbles?',
      timestamp: Date.now() - 1000 * 60 * 8
    }
  },
  {
    id: 'dm-david',
    type: 'dm',
    name: 'David Kim',
    topic: 'Direct Message',
    unreadCount: 0,
    memberIds: ['user-alex', 'user-david'],
    lastMessage: {
      senderId: 'user-david',
      text: 'Vercel deployment preview is live and passing all health checks.',
      timestamp: Date.now() - 1000 * 60 * 120
    }
  }
];

export const INITIAL_MESSAGES: Message[] = [
  // #general
  {
    id: 'msg-gen-1',
    conversationId: 'chan-general',
    senderId: 'user-maya',
    text: 'Good morning everyone! Please make sure all PRs for the upcoming deployment are tagged and reviewed by 2 PM.',
    timestamp: Date.now() - 1000 * 60 * 60 * 4,
    status: 'read',
    reactions: [
      { reactionId: 'thumbs_up', label: 'Approve', count: 3, userIds: ['user-alex', 'user-sarah', 'user-david'] },
      { reactionId: 'check', label: 'Done', count: 2, userIds: ['user-david', 'user-alex'] }
    ]
  },
  {
    id: 'msg-gen-2',
    conversationId: 'chan-general',
    senderId: 'user-alex',
    text: 'PR #108 for the MongoDB Atlas connection pooling layer is up. Latency down by 42% on warm serverless lambdas.',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    status: 'read',
    reactions: [
      { reactionId: 'rocket', label: 'Ship it', count: 4, userIds: ['user-maya', 'user-sarah', 'user-david', 'user-alex'] },
      { reactionId: 'fire', label: 'Fire', count: 2, userIds: ['user-maya', 'user-david'] }
    ]
  },
  {
    id: 'msg-gen-3',
    conversationId: 'chan-general',
    senderId: 'user-maya',
    text: 'Sprint 24 review is scheduled for 3:00 PM UTC.',
    timestamp: Date.now() - 1000 * 60 * 18,
    status: 'delivered',
    reactions: [
      { reactionId: 'thumbs_up', label: 'Approve', count: 1, userIds: ['user-alex'] }
    ]
  },

  // #design-system
  {
    id: 'msg-ds-1',
    conversationId: 'chan-design-system',
    senderId: 'user-sarah',
    text: 'Team, here is our primary design token specification for the messaging app:\n\n```css\n--color-primary: #6366f1;\n--color-surface-container: #141926;\n--md-shape-corner-md: 12px;\n--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);\n```\n\nNotice how the spring easing curve avoids sudden decelerations.',
    timestamp: Date.now() - 1000 * 60 * 30,
    status: 'read',
    reactions: [
      { reactionId: 'sparkle', label: 'Brilliant', count: 3, userIds: ['user-alex', 'user-maya', 'user-david'] }
    ]
  },
  {
    id: 'msg-ds-2',
    conversationId: 'chan-design-system',
    senderId: 'user-alex',
    text: 'Love the contrast ratio on `--color-surface-container` (passes WCAG AAA). Also, replacing system emojis with vector SVGs gives us sharp rendering on high-DPI displays without OS variations.',
    timestamp: Date.now() - 1000 * 60 * 12,
    status: 'read',
    reactions: [
      { reactionId: 'thumbs_up', label: 'Approve', count: 2, userIds: ['user-sarah', 'user-maya'] }
    ]
  },
  {
    id: 'msg-ds-3',
    conversationId: 'chan-design-system',
    senderId: 'user-sarah',
    text: 'The SVG reaction set is finalized with uniform 24px stroke coordinates.',
    timestamp: Date.now() - 1000 * 60 * 4,
    status: 'delivered',
    reactions: [
      { reactionId: 'party', label: 'Celebrate', count: 2, userIds: ['user-alex', 'user-david'] }
    ]
  },

  // Direct Message: Sarah Chen
  {
    id: 'msg-dm-1',
    conversationId: 'dm-sarah',
    senderId: 'user-alex',
    text: 'Hey Sarah! I just pushed the GSAP spring timeline for message entrances.',
    timestamp: Date.now() - 1000 * 60 * 25,
    status: 'read',
    reactions: [
      { reactionId: 'thumbs_up', label: 'Approve', count: 1, userIds: ['user-sarah'] }
    ]
  },
  {
    id: 'msg-dm-2',
    conversationId: 'dm-sarah',
    senderId: 'user-sarah',
    text: 'Could you review the GSAP timeline ease curve for the message bubbles? Let me know if `power2.out` or `back.out(1.4)` feels crisper.',
    timestamp: Date.now() - 1000 * 60 * 8,
    status: 'delivered',
    reactions: [
      { reactionId: 'rocket', label: 'Ship it', count: 1, userIds: ['user-alex'] }
    ]
  },

  // Direct Message: David Kim
  {
    id: 'msg-dm-d1',
    conversationId: 'dm-david',
    senderId: 'user-david',
    text: 'Vercel deployment preview is live and passing all health checks.',
    timestamp: Date.now() - 1000 * 60 * 120,
    status: 'read',
    reactions: [
      { reactionId: 'check', label: 'Done', count: 1, userIds: ['user-alex'] }
    ]
  }
];

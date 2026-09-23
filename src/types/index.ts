export type UserStatus = 'online' | 'busy' | 'away' | 'offline';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: string;
  status: UserStatus;
  statusMessage?: string;
  email: string;
  timezone: string;
}

export type SvgReactionId =
  | 'thumbs_up'
  | 'heart'
  | 'fire'
  | 'rocket'
  | 'sparkle'
  | 'check'
  | 'smile'
  | 'party'
  | 'eyes'
  | 'star';

export interface Reaction {
  reactionId: SvgReactionId;
  label: string;
  count: number;
  userIds: string[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'code';
  name: string;
  size: string;
  url: string;
  mimeType?: string;
}

export interface ReplyPreview {
  id: string;
  senderName: string;
  textSnippet: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  reactions: Reaction[];
  attachments?: Attachment[];
  replyTo?: ReplyPreview;
  isPinned?: boolean;
  isEdited?: boolean;
}

export type ConversationType = 'channel' | 'dm';

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  topic?: string;
  avatar?: string;
  unreadCount: number;
  isPrivate?: boolean;
  memberIds: string[];
  lastMessage?: {
    senderId: string;
    text: string;
    timestamp: number;
  };
}

export interface MongoConfig {
  uri: string;
  database: string;
  isConnected: boolean;
  lastTested?: number;
  errorMessage?: string;
}

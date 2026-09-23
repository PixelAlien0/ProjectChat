import { User, Conversation, Message, SvgReactionId, MongoConfig } from '../types';
import { INITIAL_USERS, INITIAL_CONVERSATIONS, INITIAL_MESSAGES } from './mockData';
import { REACTION_DEFINITIONS as REACTION_DEFS } from '../components/common/SvgIcons';

const USERS_KEY = 'pulsechat_users_v1';
const CONVERSATIONS_KEY = 'pulsechat_conversations_v1';
const MESSAGES_KEY = 'pulsechat_messages_v1';
const ACTIVE_USER_KEY = 'pulsechat_active_user_v1';
const THEME_KEY = 'pulsechat_theme_v1';
const MONGO_CONFIG_KEY = 'pulsechat_mongo_config_v1';

export class StorageService {
  static initStorage(): void {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
    }
    if (!localStorage.getItem(CONVERSATIONS_KEY)) {
      localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(INITIAL_CONVERSATIONS));
    }
    if (!localStorage.getItem(MESSAGES_KEY)) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(INITIAL_MESSAGES));
    }
    if (!localStorage.getItem(ACTIVE_USER_KEY)) {
      localStorage.setItem(ACTIVE_USER_KEY, 'user-alex');
    }
    if (!localStorage.getItem(THEME_KEY)) {
      localStorage.setItem(THEME_KEY, 'dark');
    }
  }

  static getUsers(): User[] {
    this.initStorage();
    try {
      const data = localStorage.getItem(USERS_KEY);
      return data ? JSON.parse(data) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  }

  static getUserById(id: string): User | undefined {
    const users = this.getUsers();
    return users.find((u) => u.id === id);
  }

  static getActiveUserId(): string {
    this.initStorage();
    return localStorage.getItem(ACTIVE_USER_KEY) || 'user-alex';
  }

  static setActiveUserId(id: string): void {
    localStorage.setItem(ACTIVE_USER_KEY, id);
  }

  static getConversations(): Conversation[] {
    this.initStorage();
    try {
      const data = localStorage.getItem(CONVERSATIONS_KEY);
      return data ? JSON.parse(data) : INITIAL_CONVERSATIONS;
    } catch {
      return INITIAL_CONVERSATIONS;
    }
  }

  static getMessages(conversationId: string): Message[] {
    this.initStorage();
    try {
      const data = localStorage.getItem(MESSAGES_KEY);
      const all: Message[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
      return all
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch {
      return [];
    }
  }

  static saveMessage(message: Message): void {
    this.initStorage();
    try {
      const data = localStorage.getItem(MESSAGES_KEY);
      const all: Message[] = data ? JSON.parse(data) : [];
      const updated = [...all, message];
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));

      // Update conversation lastMessage
      const convs = this.getConversations();
      const targetConv = convs.find((c) => c.id === message.conversationId);
      if (targetConv) {
        targetConv.lastMessage = {
          senderId: message.senderId,
          text: message.text.slice(0, 80),
          timestamp: message.timestamp
        };
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
      }
    } catch (e) {
      console.error('Failed to save message', e);
    }
  }

  static toggleReaction(messageId: string, reactionId: SvgReactionId, userId: string): Message | null {
    this.initStorage();
    try {
      const data = localStorage.getItem(MESSAGES_KEY);
      const all: Message[] = data ? JSON.parse(data) : [];
      const msgIndex = all.findIndex((m) => m.id === messageId);
      if (msgIndex === -1) return null;

      const msg = { ...all[msgIndex] };
      const reactions = [...(msg.reactions || [])];
      const existingReactionIndex = reactions.findIndex((r) => r.reactionId === reactionId);

      const def = REACTION_DEFS.find((d) => d.id === reactionId);
      const label = def ? def.label : reactionId;

      if (existingReactionIndex > -1) {
        const existing = { ...reactions[existingReactionIndex] };
        const hasUser = existing.userIds.includes(userId);

        if (hasUser) {
          // Remove user
          existing.userIds = existing.userIds.filter((u) => u !== userId);
          existing.count -= 1;
          if (existing.count <= 0) {
            reactions.splice(existingReactionIndex, 1);
          } else {
            reactions[existingReactionIndex] = existing;
          }
        } else {
          // Add user
          existing.userIds.push(userId);
          existing.count += 1;
          reactions[existingReactionIndex] = existing;
        }
      } else {
        // New reaction
        reactions.push({
          reactionId,
          label,
          count: 1,
          userIds: [userId]
        });
      }

      msg.reactions = reactions;
      all[msgIndex] = msg;
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
      return msg;
    } catch (e) {
      console.error('Failed to toggle reaction', e);
      return null;
    }
  }

  static togglePinMessage(messageId: string): Message | null {
    this.initStorage();
    try {
      const data = localStorage.getItem(MESSAGES_KEY);
      const all: Message[] = data ? JSON.parse(data) : [];
      const msgIndex = all.findIndex((m) => m.id === messageId);
      if (msgIndex === -1) return null;

      all[msgIndex].isPinned = !all[msgIndex].isPinned;
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(all));
      return all[msgIndex];
    } catch {
      return null;
    }
  }

  static deleteMessage(messageId: string): void {
    this.initStorage();
    try {
      const data = localStorage.getItem(MESSAGES_KEY);
      const all: Message[] = data ? JSON.parse(data) : [];
      const updated = all.filter((m) => m.id !== messageId);
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete message', e);
    }
  }

  static getTheme(): 'dark' | 'light' {
    this.initStorage();
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark';
  }

  static setTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.className = theme;
  }

  static getMongoConfig(): MongoConfig {
    try {
      const data = localStorage.getItem(MONGO_CONFIG_KEY);
      return data
        ? JSON.parse(data)
        : {
            uri: '',
            database: 'pulsechat',
            isConnected: false
          };
    } catch {
      return { uri: '', database: 'pulsechat', isConnected: false };
    }
  }

  static saveMongoConfig(cfg: MongoConfig): void {
    localStorage.setItem(MONGO_CONFIG_KEY, JSON.stringify(cfg));
  }
}

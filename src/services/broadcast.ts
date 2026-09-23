import { Message, SvgReactionId } from '../types';

export type BroadcastPayload =
  | { type: 'NEW_MESSAGE'; message: Message }
  | { type: 'REACTION_UPDATED'; messageId: string; reactionId: SvgReactionId; userId: string }
  | { type: 'TYPING_STATUS'; conversationId: string; userId: string; isTyping: boolean }
  | { type: 'MESSAGE_DELETED'; messageId: string }
  | { type: 'MESSAGE_PINNED'; messageId: string; isPinned: boolean };

type Listener = (payload: BroadcastPayload) => void;

class RealtimeBus {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('pulsechat_realtime_bus');
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel initialization failed, falling back to local events', err);
      }
    }
  }

  public broadcast(payload: BroadcastPayload): void {
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {
        console.error('Broadcast postMessage error', e);
      }
    }
    // Also notify listeners in current window
    this.notifyListeners(payload);
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(payload: BroadcastPayload): void {
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (e) {
        console.error('Error in broadcast listener', e);
      }
    });
  }
}

export const realtimeBus = new RealtimeBus();

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

interface CachedMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedMongoose | undefined;
}

let cached: CachedMongoose = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(customUri?: string) {
  const uri = customUri || MONGODB_URI;

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env or provide an Atlas URI');
  }

  if (cached.conn && !customUri) {
    return cached.conn;
  }

  if (!cached.promise || customUri) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Schemas
const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  conversationId: { type: String, required: true, index: true },
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Number, required: true, index: true },
  status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
  reactions: [
    {
      reactionId: String,
      label: String,
      count: Number,
      userIds: [String]
    }
  ],
  attachments: [
    {
      id: String,
      type: { type: String },
      name: String,
      size: String,
      url: String
    }
  ],
  replyTo: {
    id: String,
    senderName: String,
    textSnippet: String
  },
  isPinned: { type: Boolean, default: false }
});

export const MessageModel = mongoose.models.Message || mongoose.model('Message', MessageSchema);

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true },
  avatar: { type: String, default: '' },
  role: { type: String, default: 'Member' },
  status: { type: String, enum: ['online', 'busy', 'away', 'offline'], default: 'online' },
  statusMessage: { type: String, default: '' },
  email: { type: String, default: '' },
  timezone: { type: String, default: 'UTC' }
});

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

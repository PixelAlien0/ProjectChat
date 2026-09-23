import type { IncomingMessage, ServerResponse } from 'http';
import { connectToDatabase, UserModel } from '../lib/mongodb';

export default async function handler(req: IncomingMessage & { body?: any; url?: string }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  try {
    await connectToDatabase();

    // GET /api/users
    if (req.method === 'GET') {
      const users = await UserModel.find({}).limit(50);
      res.statusCode = 200;
      res.end(JSON.stringify(users));
      return;
    }

    // POST /api/users (register or update profile)
    if (req.method === 'POST') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const data = JSON.parse(body || '{}');

      const user = await UserModel.findOneAndUpdate(
        { id: data.id },
        { $set: data },
        { upsert: true, new: true }
      );

      res.statusCode = 200;
      res.end(JSON.stringify(user));
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
  }
}

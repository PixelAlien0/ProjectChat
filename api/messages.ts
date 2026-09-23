import type { IncomingMessage, ServerResponse } from 'http';
import { connectToDatabase, MessageModel } from '../lib/mongodb';

export default async function handler(req: IncomingMessage & { body?: any; url?: string }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  try {
    await connectToDatabase();

    const parsedUrl = new URL(req.url || '', 'http://localhost');

    if (req.method === 'GET') {
      const conversationId = parsedUrl.searchParams.get('conversationId');
      if (!conversationId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing conversationId' }));
        return;
      }

      const messages = await MessageModel.find({ conversationId }).sort({ timestamp: 1 }).limit(100);
      res.statusCode = 200;
      res.end(JSON.stringify(messages));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const data = JSON.parse(body || '{}');

      const newMsg = await MessageModel.create(data);
      res.statusCode = 201;
      res.end(JSON.stringify(newMsg));
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
  }
}

import type { IncomingMessage, ServerResponse } from 'http';
import { connectToDatabase, MessageModel } from '../lib/mongodb';

export default async function handler(req: IncomingMessage & { body?: any; url?: string }, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json');

  try {
    await connectToDatabase();

    const parsedUrl = new URL(req.url || '', 'http://localhost');

    // GET /api/messages?conversationId=...&since=...
    if (req.method === 'GET') {
      const conversationId = parsedUrl.searchParams.get('conversationId');
      if (!conversationId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing conversationId' }));
        return;
      }

      const since = parsedUrl.searchParams.get('since');
      const query: any = { conversationId };
      if (since) {
        query.timestamp = { $gt: Number(since) };
      }

      const messages = await MessageModel.find(query).sort({ timestamp: 1 }).limit(100);
      res.statusCode = 200;
      res.end(JSON.stringify(messages));
      return;
    }

    // POST /api/messages
    if (req.method === 'POST') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const data = JSON.parse(body || '{}');

      // Upsert message
      const saved = await MessageModel.findOneAndUpdate(
        { id: data.id },
        { $set: data },
        { upsert: true, new: true }
      );

      res.statusCode = 201;
      res.end(JSON.stringify(saved));
      return;
    }

    // PUT /api/messages (reactions, pin)
    if (req.method === 'PUT') {
      let body = '';
      for await (const chunk of req) {
        body += chunk;
      }
      const { id, reactions, isPinned } = JSON.parse(body || '{}');

      const updateFields: any = {};
      if (reactions !== undefined) updateFields.reactions = reactions;
      if (isPinned !== undefined) updateFields.isPinned = isPinned;

      const updated = await MessageModel.findOneAndUpdate(
        { id },
        { $set: updateFields },
        { new: true }
      );

      res.statusCode = 200;
      res.end(JSON.stringify(updated));
      return;
    }

    // DELETE /api/messages?id=...
    if (req.method === 'DELETE') {
      const id = parsedUrl.searchParams.get('id');
      if (!id) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing message id' }));
        return;
      }

      await MessageModel.deleteOne({ id });
      res.statusCode = 200;
      res.end(JSON.stringify({ success: true }));
      return;
    }

    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
  }
}

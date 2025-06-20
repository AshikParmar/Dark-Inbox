// app/api/sse/route.ts
import { NextRequest } from 'next/server';
import { addClient, removeClient } from '@/lib/sse';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');
  if (!username) {
    return new Response('Username required', { status: 400 });
  }

  const encoder = new TextEncoder();

  let sendMessage: (data: string) => void;

  const stream = new ReadableStream({
    start(controller) {
      sendMessage = (data: string) => {
        controller.enqueue(encoder.encode(data));
      };

      // Save this user's message sender function
      addClient(username, sendMessage);

      // Send connected message
      // console.log("Sending connected message", sendMessage);
      sendMessage(`event: connected\ndata: Connected to ${username}\n\n`);
    },
    cancel() {
      console.log(`❌ Connection closed for ${username}`);
      removeClient(username);
    }
  });

  console.log(`✅ SSE Stream started for ${username}`);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

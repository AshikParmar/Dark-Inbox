import { Message } from '@/model/userModel';
import { useEffect, useState } from 'react';

/**
 * Custom hook to receive live messages via Server-Sent Events (SSE).
 *
 * @param username - Username whose messages to subscribe to.
 * @returns { messages, isConnected }
 */
export function useMessageStream(username: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!username) return;
    
    const eventSource = new EventSource(`/api/messages/stream?username=${username}`);
    eventSource.onopen = () => {
      setIsConnected(true);
      console.log(`✅ Connected to message stream for user: ${username}`);
    };

    eventSource.onmessage = (event: MessageEvent<string>) => {
      try {
        console.log("Received message", event.data);
        const parsed: Message = JSON.parse(event.data);
        setMessages((prev) => [...prev, parsed]);
      } catch (err) {
        console.error('❌ Failed to parse message data:', event.data);
      }
    };

    eventSource.onerror = (err) => {
      console.error('❌ SSE error:', err);
      setIsConnected(false);
      eventSource.close(); // You could implement a reconnection strategy here
    };

    return () => {
      eventSource.close();
      console.log(`🔌 Disconnected from message stream for user: ${username}`);
    };
  }, [username]);

  return { messages, isConnected };
}

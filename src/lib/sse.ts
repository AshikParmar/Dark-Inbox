// lib/sse.ts
type ClientMap = Map<string, (data: string) => void>;

const clients: ClientMap = new Map();

export function addClient(username: string, send: (data: string) => void) {
  clients.set(username, send);
}

export function removeClient(username: string) {
  clients.delete(username);
}

export function sendMessage(username: string, message: any) {
  const send = clients.get(username);
  if (!send) {
    console.warn(`No active SSE client for ${username}`);
    return;
  }

  const payload = `data: ${JSON.stringify(message)}\n\n`;
  send(payload);
}


const memory = new Map();

// sessionId => [{role, content}]
export function getMemory(sessionId) {
  if (!memory.has(sessionId)) memory.set(sessionId, []);
  return memory.get(sessionId);
}

export function addMemory(sessionId, role, content) {
  const chat = getMemory(sessionId);
  chat.push({ role, content });

  if (chat.length > 30) {
    chat.shift();
  }
}

export function clearMemory(sessionId) {
  memory.set(sessionId, []);
}

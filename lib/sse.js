let sseClients = [];

function broadcastSSE(data, eventType = 'appointment') {
  const msg = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients = sseClients.filter(c => {
    try { c.write(msg); return true; } catch { return false; }
  });
}

function addClient(res) {
  sseClients.push(res);
}

function removeClient(res) {
  sseClients = sseClients.filter(c => c !== res);
}

module.exports = { broadcastSSE, addClient, removeClient, sseClients };

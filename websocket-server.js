const WebSocket = require('ws');

const PORT = process.env.WS_PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

// Store the current roulette state
let rouletteState = {
  isSpinning: false,
  currentRotation: 0,
  spinData: null // Will hold spin parameters when spinning
};

// Broadcast to all connected clients
function broadcast(data, excludeWs = null) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== excludeWs) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on('connection', (ws) => {
  console.log('Client connected. Total clients:', wss.clients.size);

  // Send current state to newly connected client
  ws.send(JSON.stringify({
    type: 'sync',
    state: rouletteState
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data.type);

      switch (data.type) {
        case 'spin':
          // Someone triggered a spin
          if (!rouletteState.isSpinning) {
            rouletteState.isSpinning = true;
            rouletteState.spinData = {
              spinDuration: data.spinDuration,
              finalRotation: data.finalRotation,
              startTime: Date.now()
            };
            // Broadcast spin event to all OTHER clients (exclude sender)
            broadcast({
              type: 'spin',
              spinDuration: data.spinDuration,
              finalRotation: data.finalRotation
            }, ws);
            console.log('Broadcasting spin to', wss.clients.size - 1, 'other clients');
          }
          break;

        case 'spinComplete':
          // Spin completed
          rouletteState.isSpinning = false;
          rouletteState.currentRotation = data.currentRotation;
          rouletteState.spinData = null;
          broadcast({
            type: 'spinComplete',
            currentRotation: data.currentRotation
          }, ws);
          break;

        case 'requestSync':
          // Client requesting current state
          ws.send(JSON.stringify({
            type: 'sync',
            state: rouletteState
          }));
          break;
      }
    } catch (e) {
      console.error('Error parsing message:', e);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected. Total clients:', wss.clients.size);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);

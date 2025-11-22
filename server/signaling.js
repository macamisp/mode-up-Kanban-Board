
/**
 * Simple WebSocket Signaling Server for Yjs WebRTC
 * 
 * This server facilitates the initial connection between peers.
 * It does NOT store any data. It only forwards signaling messages.
 */

import { WebSocketServer } from 'ws';
import http from 'http';

const port = process.env.PORT || 4444;
const server = http.createServer((request, response) => {
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('Signaling server is running');
});

const wss = new WebSocketServer({ server });

// Map of topics to sets of connected sockets
const topics = new Map();

wss.on('connection', (conn) => {
    console.log('New connection');

    const subscribedTopics = new Set();

    conn.on('message', (message) => {
        let parsedMessage;
        try {
            parsedMessage = JSON.parse(message);
        } catch (e) {
            return;
        }

        const { type, topics: messageTopics } = parsedMessage;

        switch (type) {
            case 'subscribe':
                (messageTopics || []).forEach(topicName => {
                    subscribedTopics.add(topicName);

                    if (!topics.has(topicName)) {
                        topics.set(topicName, new Set());
                    }
                    topics.get(topicName).add(conn);
                });
                break;

            case 'unsubscribe':
                (messageTopics || []).forEach(topicName => {
                    subscribedTopics.delete(topicName);

                    if (topics.has(topicName)) {
                        topics.get(topicName).delete(conn);
                        // Clean up empty topics
                        if (topics.get(topicName).size === 0) {
                            topics.delete(topicName);
                        }
                    }
                });
                break;

            case 'publish':
                if (parsedMessage.topic) {
                    const receivers = topics.get(parsedMessage.topic);
                    if (receivers) {
                        receivers.forEach(receiver => {
                            if (receiver !== conn) {
                                receiver.send(message);
                            }
                        });
                    }
                }
                break;

            case 'ping':
                conn.send(JSON.stringify({ type: 'pong' }));
                break;
        }
    });

    conn.on('close', () => {
        subscribedTopics.forEach(topicName => {
            if (topics.has(topicName)) {
                topics.get(topicName).delete(conn);
                if (topics.get(topicName).size === 0) {
                    topics.delete(topicName);
                }
            }
        });
        console.log('Connection closed');
    });
});

server.listen(port, () => {
    console.log(`Signaling server running on port ${port}`);
});

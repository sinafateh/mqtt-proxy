const aedes = require('aedes')();
const httpServer = require('http').createServer();
const ws = require('websocket-stream');
const port = process.env.PORT || 3000;

const mqtt = require('mqtt');

// HiveMQ config
const MQTT_URL = "mqtts://53e3a5245e564c429dd1de0947f554a0.s1.eu.hivemq.cloud:8883";
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

const client = mqtt.connect(MQTT_URL, {
  username: MQTT_USERNAME,
  password: MQTT_PASSWORD,
  reconnectPeriod: 1000
});

// WebSocket proxy
ws.createServer({ server: httpServer }, aedes.handle);
httpServer.listen(port, () => {
  console.log("🚀 Proxy running on port", port);
});

// Relay between Web UI <-> HiveMQ
aedes.on('publish', (packet, clientInstance) => {
  if (packet && packet.topic) {
    console.log("📩 UI → HiveMQ:", packet.topic, packet.payload.toString());
    client.publish(packet.topic, packet.payload.toString());
  }
});

client.on('connect', () => {
  console.log("✅ Connected to HiveMQ");
  client.subscribe("esp01/state");
});

client.on('message', (topic, message) => {
  console.log("📤 HiveMQ → UI:", topic, message.toString());
  aedes.publish({ topic, payload: message });
});

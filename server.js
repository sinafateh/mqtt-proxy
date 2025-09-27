const mqtt = require("mqtt");
const WebSocket = require("ws");
const express = require("express");

const app = express();
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server });

// HiveMQ تنظیمات
const MQTT_URL = "mqtts://53e3a5245e564c429dd1de0947f554a0.s1.eu.hivemq.cloud:8883";
const MQTT_USER = "SinaFateh";
const MQTT_PASS = "123456789Sina";

// اتصال به HiveMQ
const mqttClient = mqtt.connect(MQTT_URL, {
  username: MQTT_USER,
  password: MQTT_PASS,
  rejectUnauthorized: false
});

mqttClient.on("connect", () => {
  console.log("✅ Connected to HiveMQ");
  mqttClient.subscribe("esp01/state");
});

// اتصال Web UI به پروکسی
wss.on("connection", (ws) => {
  console.log("🌐 Web client connected");

  ws.on("message", (msg) => {
    console.log("➡️ From Web:", msg.toString());
    mqttClient.publish("esp01/cmd", msg.toString());
  });

  mqttClient.on("message", (topic, message) => {
    if (topic === "esp01/state") {
      console.log("⬅️ From MQTT:", message.toString());
      ws.send(message.toString());
    }
  });
});

// Render روی پورت مشخص
const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Proxy server running on ws://localhost:${PORT}`);
});

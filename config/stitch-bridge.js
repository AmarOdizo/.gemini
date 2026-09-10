#!/usr/bin/env node
const readline = require('readline');

const API_KEY = process.env.STITCH_API_KEY || '';
const STITCH_URL = 'https://stitch.googleapis.com/mcp';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;
  try {
    const payload = JSON.parse(trimmed);
    
    // Notifications in JSON-RPC do not expect a response
    const isNotification = payload.id === undefined || payload.id === null;

    const res = await fetch(STITCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY
      },
      body: trimmed
    });

    if (isNotification) return;

    const data = await res.text();
    process.stdout.write(data.trim() + '\n');
  } catch (err) {
    // If not a notification, respond with JSON-RPC error
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && parsed.id !== undefined) {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id: parsed.id,
          error: { code: -32603, message: err.message }
        }) + '\n');
      }
    } catch (_) {}
  }
});

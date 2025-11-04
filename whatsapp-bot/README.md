# WhatsApp Bot

Simple WhatsApp bot that forwards messages to the Gozy Hono application.

## Features

- QR code authentication
- Message forwarding to webhook
- Session persistence
- Simple ping/pong test command
- Docker support

## Local Development

### Prerequisites

- Node.js 24
- npm

### Setup

```bash
cd whatsapp-bot
npm install
```

### Run

```bash
npm run dev
```

Scan the QR code with your WhatsApp mobile app to authenticate.

### Environment Variables

- `WEBHOOK_URL` - URL to forward messages to (default: `http://localhost:8787/webhook/whatsapp`)

## Docker

### Build

```bash
docker build -t whatsapp-bot .
```

### Run

```bash
docker run -it --rm \
  -v $(pwd)/.wwebjs_auth:/app/.wwebjs_auth \
  -e WEBHOOK_URL=http://host.docker.internal:8787/webhook/whatsapp \
  whatsapp-bot
```

The volume mount persists the WhatsApp session between container restarts.

## Testing

Send `!ping` to the bot to test the connection. It should reply with `pong`.

## Architecture

The bot:

1. Connects to WhatsApp using whatsapp-web.js
2. Listens for incoming messages
3. Forwards messages to the configured webhook URL
4. Expects a JSON response with optional `reply` field
5. Sends the reply back to WhatsApp if provided

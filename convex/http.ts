/**
 * HTTP API Routes for Convex
 * Defines HTTP endpoints for the application
 */

import { httpRouter } from 'convex/server';
import { httpAction } from './_generated/server';
import { streamChat } from './ai_chat';

const http = httpRouter();

// AI Chat streaming endpoint
http.route({
  path: '/chat-stream',
  method: 'POST',
  handler: streamChat,
});

// Handle CORS preflight requests
http.route({
  path: '/chat-stream',
  method: 'OPTIONS',
  handler: httpAction(async () => {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        Vary: 'Origin',
      },
    });
  }),
});

export default http;

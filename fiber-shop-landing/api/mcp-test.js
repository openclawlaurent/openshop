/**
 * MCP test — try actual request handling
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, mcp-session-id');
  res.setHeader('Access-Control-Expose-Headers', 'mcp-session-id');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Debug: log what Vercel gives us
  if (req.method === 'GET' && !req.headers.accept?.includes('text/event-stream')) {
    return res.status(200).json({
      info: 'FiberAgent MCP Server',
      usage: 'POST JSON-RPC messages to this endpoint',
      method: req.method,
      bodyType: typeof req.body,
      bodyIsNull: req.body === null,
      bodyIsUndefined: req.body === undefined,
      headers: {
        contentType: req.headers['content-type'],
        accept: req.headers['accept'],
      }
    });
  }

  try {
    const server = new McpServer(
      { name: 'FiberAgent', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );

    server.tool(
      'search_products',
      'Search products',
      { keywords: z.string() },
      async ({ keywords }) => ({
        content: [{ type: 'text', text: `Results for: ${keywords}` }],
      })
    );

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);

    // Pass req.body as pre-parsed body (Vercel already parses it)
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error('MCP error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: err.message,
        stack: err.stack?.split('\n').slice(0, 5),
      });
    }
  }
}

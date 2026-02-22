/**
 * Minimal MCP test endpoint — isolate the issue
 */
export default async function handler(req, res) {
  try {
    // Test 1: Can we import MCP SDK?
    const { McpServer } = await import('@modelcontextprotocol/sdk/server/mcp.js');
    
    // Test 2: Can we import transport?
    const { StreamableHTTPServerTransport } = await import('@modelcontextprotocol/sdk/server/streamableHttp.js');
    
    // Test 3: Can we import zod?
    const { z } = await import('zod');

    return res.status(200).json({
      ok: true,
      mcpServer: typeof McpServer,
      transport: typeof StreamableHTTPServerTransport,
      zod: typeof z.string,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
      stack: err.stack?.split('\n').slice(0, 5),
    });
  }
}

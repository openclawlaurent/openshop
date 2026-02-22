# FiberAgent → MCP Server Implementation Plan

## What Is MCP?

Model Context Protocol — Anthropic's open standard for connecting AI apps (Claude, ChatGPT, Cursor, VS Code, etc.) to external tools and data. Think "USB-C for AI": any MCP-compatible client can discover and use FiberAgent's tools without custom integration code.

**Why it matters for FiberAgent:** Instead of agents needing to read our OpenAPI spec, parse JSON, and write HTTP calls — they just connect to our MCP server and get typed tools they can call natively. Claude could literally say "search for Nike shoes on Fiber" and it works.

## Architecture

```
┌─────────────────────┐
│ MCP Client          │  Claude Desktop, Cursor, OpenClaw,
│ (AI Application)    │  ChatGPT, any MCP-compatible agent
└────────┬────────────┘
         │ Streamable HTTP (JSON-RPC over HTTP + SSE)
         │
┌────────▼────────────┐
│ FiberAgent MCP      │  Remote MCP Server
│ Server              │  Hosted on Vercel / standalone
│                     │
│ ┌─ Tools ─────────┐ │
│ │ search_products  │ │  → Fiber API / mock catalog
│ │ search_by_intent │ │  → NL task processing
│ │ register_agent   │ │  → Agent registration
│ │ get_agent_stats  │ │  → Agent performance
│ │ get_cashback     │ │  → Compare cashback rates
│ └─────────────────┘ │
│                     │
│ ┌─ Resources ─────┐ │
│ │ merchant_catalog │ │  → Browse 50K+ merchants
│ │ agent_card       │ │  → Agent discovery metadata
│ │ cashback_rates   │ │  → Current top cashback rates
│ └─────────────────┘ │
│                     │
│ ┌─ Prompts ───────┐ │
│ │ shopping_agent   │ │  → "Act as a shopping assistant"
│ │ deal_finder      │ │  → "Find the best deal for {item}"
│ │ compare_prices   │ │  → "Compare prices across merchants"
│ └─────────────────┘ │
└─────────────────────┘
```

## Implementation Phases

### Phase 1: Core MCP Server (2-3 hours) ⭐ DO THIS FIRST

**Goal:** Working MCP server with 3 tools, deployable on Vercel

**Stack:**
- `@modelcontextprotocol/sdk` v1.x (stable, recommended for production)
- `zod` for schema validation
- Streamable HTTP transport (for remote access — clients connect over HTTPS)
- Express middleware via `@modelcontextprotocol/express` (if using Express) OR standalone HTTP handler

**Files to create:**
```
mcp/
├── server.js          # MCP server definition (tools, resources, prompts)
├── tools/
│   ├── search.js      # search_products tool
│   ├── task.js        # search_by_intent tool (NL)
│   └── register.js    # register_agent tool
├── resources/
│   └── catalog.js     # merchant catalog resource
└── prompts/
    └── shopping.js    # shopping assistant prompt
```

**Vercel serverless entry point:**
```
api/mcp.js             # Streamable HTTP endpoint at /api/mcp
```

**Tools to implement:**

| Tool | Input Schema | Description |
|------|-------------|-------------|
| `search_products` | `{ keywords: string, agent_id?: string, max_results?: number }` | Search products across 50K+ merchants, returns products with cashback |
| `search_by_intent` | `{ intent: string, agent_id?: string, preferences?: string[], max_price?: number }` | Natural language shopping — "Find creatine under $30" |
| `register_agent` | `{ agent_id: string, wallet_address: string, agent_name?: string }` | Register an AI agent to earn cashback |
| `get_agent_stats` | `{ agent_id: string }` | Get agent performance metrics |
| `compare_cashback` | `{ product_query: string, agent_id?: string }` | Find same product across merchants, compare cashback rates |

**Implementation pattern (v1.x SDK):**
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "FiberAgent",
  version: "1.0.0",
});

server.tool(
  "search_products",
  "Search for products across 50,000+ merchants with real-time cashback rates",
  {
    keywords: z.string().describe("Product search terms (e.g., 'nike running shoes')"),
    agent_id: z.string().optional().describe("Your agent ID for earning cashback"),
    max_results: z.number().optional().default(5).describe("Max results to return (1-20)"),
  },
  async ({ keywords, agent_id, max_results }) => {
    // Call existing search logic from utils.js
    const results = await searchProducts(keywords, agent_id, max_results);
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  }
);
```

**Transport — Streamable HTTP on Vercel:**
```typescript
// api/mcp.js — Vercel serverless function
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export default async function handler(req, res) {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined }); // stateless
  await server.connect(transport);
  await transport.handleRequest(req, res);
}
```

### Phase 2: Resources + Prompts (1-2 hours)

**Resources** (read-only data clients can browse):

| Resource URI | Description |
|-------------|-------------|
| `fiber://merchants/top` | Top 50 merchants by cashback rate |
| `fiber://agent/{agent_id}` | Agent profile and stats |
| `fiber://rates/trending` | Trending cashback rates |

**Prompts** (pre-built templates for common workflows):

| Prompt | Arguments | Description |
|--------|-----------|-------------|
| `shopping_assistant` | `{ budget?: string, category?: string }` | Full shopping agent system prompt |
| `deal_finder` | `{ item: string }` | Find the best deal for a specific item |
| `compare_prices` | `{ product: string }` | Cross-merchant price + cashback comparison |

### Phase 3: Discovery & Integration (1 hour)

1. **MCP endpoint in agent-card.json:**
```json
{
  "mcp": {
    "transport": "streamable-http",
    "url": "https://fiberagent.shop/api/mcp"
  }
}
```

2. **Register on MCP directories:**
   - GitHub MCP Registry (https://github.com/mcp)
   - Add to awesome-mcp-servers list
   - Claude Desktop config example in README

3. **Claude Desktop config snippet** (for README):
```json
{
  "mcpServers": {
    "fiberagent": {
      "url": "https://fiberagent.shop/api/mcp"
    }
  }
}
```

4. **Update discovery files:**
   - `/.well-known/agent-card.json` — add MCP transport info
   - `/.well-known/ai-plugin.json` — reference MCP endpoint
   - `/api/docs` — OpenAPI spec references MCP as alternative

### Phase 4: Advanced Features (future)

- **OAuth authentication** for premium agent tiers
- **SSE notifications** — push cashback alerts to connected agents  
- **Task-based execution** — long-running price monitoring
- **Sampling** — let FiberAgent ask the client's LLM for help with intent parsing
- **Bidirectional** — FiberAgent calls back to connected agents (Oracle's #5)

## Priority Order

```
Phase 1 (NOW)   → Working MCP server with tools     → 2-3h
Phase 2 (NEXT)  → Resources + prompts               → 1-2h  
Phase 3 (THEN)  → Discovery, directories, README     → 1h
Phase 4 (LATER) → Auth, SSE, tasks, bidirectional    → ongoing
```

## Technical Decisions

| Decision | Choice | Why |
|----------|--------|-----|
| SDK version | v1.x (stable) | v2 is pre-alpha, not recommended for production |
| Transport | Streamable HTTP | Remote server — clients connect over HTTPS. STDIO is for local-only |
| Session mode | Stateless | Vercel serverless can't maintain sessions across cold starts |
| Deployment | Vercel serverless (`api/mcp.js`) | Already deployed there, same infra |
| Auth | None initially | Matches existing REST API (no auth barrier for agents) |
| Schema validation | Zod | Required peer dep of MCP SDK |

## What This Enables

Once live, any MCP-compatible client can:

```
User: "Find me the best Nike running shoes with cashback"

Claude (via MCP): 
  → Discovers FiberAgent MCP server
  → Calls search_products({ keywords: "nike running shoes" })
  → Gets results with prices, cashback rates, affiliate links
  → Presents comparison to user

No API keys. No custom code. Just connect and go.
```

**Compatible clients (day 1):**
- Claude Desktop
- Claude Code  
- Cursor
- VS Code (via Copilot MCP)
- ChatGPT (MCP support announced)
- OpenClaw
- Any LangChain/AutoGen agent with MCP client

## Files Affected

| File | Action |
|------|--------|
| `mcp/server.js` | NEW — MCP server definition |
| `api/mcp.js` | NEW — Vercel serverless entry point |
| `package.json` | ADD deps: `@modelcontextprotocol/sdk`, `zod` |
| `.well-known/agent-card.json` | UPDATE — add MCP transport |
| `server/openapi.json` | UPDATE — reference MCP endpoint |
| `README.md` | UPDATE — MCP integration docs |
| `vercel.json` | UPDATE — ensure `/api/mcp` routes correctly |

---

*Ready to build. Say "go" and I'll start Phase 1.*

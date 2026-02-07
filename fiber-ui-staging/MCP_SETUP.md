# MCP (Model Context Protocol) Setup

This project uses MCPs to enhance the development experience with direct access to Supabase and filesystem operations.

## Configured MCPs

### 1. Supabase MCP ✅

**Purpose:** Direct access to your Supabase database schema, types, and data

**Capabilities:**

- Query database schema
- Inspect table structures
- View column types and constraints
- Access enum values
- Generate TypeScript types on-the-fly
- Validate data access patterns

**Configuration:**

```json
{
  "supabase": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-supabase"],
    "env": {
      "SUPABASE_URL": "https://pqzdcscbwwapxsuygizi.supabase.co",
      "SUPABASE_ANON_KEY": "sb_publishable_...",
      "SUPABASE_SERVICE_ROLE_KEY": "sb_secret_..."
    }
  }
}
```

**Benefits for Refactoring:**

- No manual type generation needed
- Accurate enum values from database
- Real-time schema inspection
- Validate table structures during refactoring

### 2. Filesystem MCP ✅

**Purpose:** Direct filesystem access for the project

**Capabilities:**

- Read/write files efficiently
- Search files and directories
- Navigate project structure
- Perform bulk file operations

**Configuration:**

```json
{
  "filesystem": {
    "command": "npx",
    "args": [
      "-y",
      "@modelcontextprotocol/server-filesystem",
      "/Users/longfellowdeeds/Code/other/fiber-ui"
    ]
  }
}
```

### 3. GitHub MCP (Disabled)

**Purpose:** GitHub integration for issues, PRs, etc.

**Status:** Currently disabled. Enable when needed by:

1. Adding your GitHub Personal Access Token
2. Setting `"disabled": false` in the config

## MCP Configuration Location

**File:** `~/.config/claude-code/mcp.json`

This file is automatically loaded by Claude Code CLI.

## How MCPs Help This Refactoring

### Database Schema Access

Instead of manually running:

```bash
supabase gen types typescript --linked > types/database.types.ts
```

Claude can now:

- Inspect tables directly
- See exact column types
- Access enum values
- Validate type definitions

### Example Queries Claude Can Do

**Get table schema:**

```
Show me the schema for the user_profiles table
```

**Get enum values:**

```
What are the values for the offer_status enum?
```

**Check relationships:**

```
What foreign keys does the cashback_transactions table have?
```

**Validate types:**

```
Does the partner_tokens table have a brand_color column?
```

## Updating MCP Configuration

If Doppler secrets change, update the MCP config:

```bash
# Get latest secrets
doppler secrets get SUPABASE_SECRET_KEY --plain

# Update ~/.config/claude-code/mcp.json with new values
```

## Troubleshooting

### MCP Not Working

1. Restart Claude CLI session
2. Check MCP config syntax: `cat ~/.config/claude-code/mcp.json | jq`
3. Verify environment variables are correct

### Supabase MCP Errors

1. Verify `SUPABASE_URL` is correct
2. Check that service role key has proper permissions
3. Ensure network access to Supabase

### Filesystem MCP Issues

1. Verify project path is correct
2. Check file permissions

## Adding More MCPs

To add additional MCPs (e.g., Doppler when available):

1. Edit `~/.config/claude-code/mcp.json`
2. Add new MCP server configuration
3. Restart Claude CLI

Example:

```json
{
  "mcpServers": {
    "supabase": { ... },
    "filesystem": { ... },
    "custom-mcp": {
      "command": "npx",
      "args": ["-y", "@custom/mcp-server"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

## Security Notes

⚠️ **Important:** The MCP config file contains sensitive credentials:

- Supabase service role key (bypasses RLS)
- Database connection details

**Best Practices:**

- Never commit MCP config to git (it's in `~/.config`, not the project)
- Rotate keys if they're exposed
- Keep MCP config file permissions restricted: `chmod 600 ~/.config/claude-code/mcp.json`

## Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP Server List](https://github.com/modelcontextprotocol/servers)
- [Supabase MCP Documentation](https://github.com/modelcontextprotocol/servers/tree/main/src/supabase)

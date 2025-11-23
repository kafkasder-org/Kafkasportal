# Cursor IDE Configuration

This directory contains configuration files for Cursor IDE.

## MCP Settings

### Setup

1. Copy the example configuration:
   ```bash
   cp mcp_settings.example.json mcp_settings.json
   ```

2. Edit `mcp_settings.json` and replace placeholders:
   - `your-appwrite-api-key-here` → Your Appwrite API key
   - `your-project-id-here` → Your Appwrite project ID
   - `your-github-token-here` → Your GitHub personal access token

3. Restart Cursor IDE to load the new configuration

### Security

⚠️ **IMPORTANT**: Never commit `mcp_settings.json` with real credentials!

The file is already in `.gitignore` to prevent accidental commits.

### Available MCP Servers

- **appwrite-docs**: Appwrite documentation
- **appwrite**: Appwrite user management
- **Browser Use**: Web browser automation
- **Chrome DevTools**: Chrome developer tools
- **github**: GitHub repository management

### Documentation

For detailed setup instructions, see [docs/mcp-setup.md](../docs/mcp-setup.md)

### Getting Credentials

#### Appwrite API Key
1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Select your project
3. Navigate to Overview > Integrations > API Keys
4. Create a new API key with required permissions

#### GitHub Token
1. Go to [GitHub Settings](https://github.com/settings/tokens)
2. Generate a new token (classic)
3. Select scopes: `repo`, `read:org`, `workflow`

### Troubleshooting

If MCP servers don't work:
1. Check that credentials are correct
2. Verify all required tools are installed (Node.js, Python, uv)
3. Restart Cursor IDE
4. Check Cursor logs for errors

For more help, see the [MCP Setup Guide](../docs/mcp-setup.md#sorun-giderme)

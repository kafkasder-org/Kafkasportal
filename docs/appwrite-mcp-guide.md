# Appwrite MCP Guide

## Overview

Appwrite MCP (Model Context Protocol) provides direct access to Appwrite's user management and authentication features through MCP tools. This allows you to interact with your Appwrite backend directly from Cursor.

## Available MCP Tools

The Appwrite MCP server provides comprehensive user management capabilities:

### User Management
- **Create Users**: Create new users with various password hashing options (plain text, Argon2, Bcrypt, MD5, SHA, Scrypt, PHPass)
- **Get Users**: Retrieve user information by ID
- **List Users**: Query and search users
- **Update Users**: Update email, name, phone, password, status, preferences, labels
- **Delete Users**: Remove users from the system

### Authentication & Sessions
- **Create Sessions**: Generate sessions for users
- **List Sessions**: View all user sessions
- **Delete Sessions**: Remove specific or all user sessions
- **Create JWT**: Generate JSON Web Tokens for user authentication
- **Create Token**: Generate secret tokens for session creation

### Multi-Factor Authentication (MFA)
- **List MFA Factors**: View available MFA factors
- **Create Recovery Codes**: Generate MFA recovery codes
- **Get Recovery Codes**: Retrieve existing recovery codes
- **Update MFA**: Enable or disable MFA for users
- **Delete MFA Authenticator**: Remove authenticator apps

### User Targets (Push Notifications)
- **Create Target**: Set up messaging targets (email, SMS, push)
- **Get Target**: Retrieve target information
- **List Targets**: View all user targets
- **Update Target**: Modify target settings
- **Delete Target**: Remove messaging targets

### Identities
- **List Identities**: View all user identities
- **Delete Identity**: Remove user identities

### User Preferences & Metadata
- **Get Preferences**: Retrieve user preferences
- **Update Preferences**: Modify user preferences (max 64kB)
- **Update Labels**: Manage user labels
- **List Memberships**: View team memberships
- **List Logs**: Get user activity logs

## Usage Examples

### Creating a User

```typescript
// Create a user with plain text password
mcp_appwrite_users_create({
  user_id: "unique-user-id",
  email: "user@example.com",
  password: "secure-password-123",
  name: "John Doe"
})
```

### Listing Users

```typescript
// List all users
mcp_appwrite_users_list({})

// Search for users
mcp_appwrite_users_list({
  search: "john",
  queries: ["limit(10)"]
})
```

### Creating a Session

```typescript
// Create a session for a user
mcp_appwrite_users_create_session({
  user_id: "unique-user-id"
})
```

### Managing MFA

```typescript
// Enable MFA for a user
mcp_appwrite_users_update_mfa({
  user_id: "unique-user-id",
  mfa: true
})

// Generate recovery codes
mcp_appwrite_users_create_mfa_recovery_codes({
  user_id: "unique-user-id"
})
```

## Integration with Your Project

Your project already has Appwrite configured in:
- `src/lib/appwrite/config.ts` - Configuration
- `src/lib/appwrite/client.ts` - Client-side SDK
- `src/lib/appwrite/server.ts` - Server-side SDK

The MCP tools complement these SDK clients by providing:
1. **Direct CLI access** to user management operations
2. **Quick testing** of user operations without writing code
3. **Administrative tasks** like bulk user operations
4. **Debugging** user authentication issues

## Environment Variables

Ensure these are set in your `.env.local`:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
```

## Best Practices

1. **User IDs**: Use `ID.unique()` for auto-generated IDs or provide custom IDs following Appwrite's format (a-z, A-Z, 0-9, period, hyphen, underscore, max 36 chars)

2. **Passwords**: 
   - Minimum 8 characters for plain text passwords
   - Use appropriate hashing algorithms for migration scenarios

3. **Sessions**: Sessions are immediately usable after creation

4. **MFA**: Always generate recovery codes when enabling MFA

5. **Preferences**: Keep preferences under 64kB limit

## Security Notes

- API keys should be kept secure and never exposed to client-side code
- Use server-side MCP tools for sensitive operations
- Validate user inputs before creating/updating users
- Regularly audit user sessions and remove inactive ones

## Troubleshooting

### No MCP Resources Found
This is normal - MCP resources are different from MCP tools. The tools are available even if no resources are listed.

### Authentication Errors
- Verify your `APPWRITE_API_KEY` is correct
- Ensure your project ID matches your Appwrite instance
- Check that the endpoint URL is correct

### User Creation Fails
- Verify user ID format (no special chars at start, max 36 chars)
- Ensure email format is valid
- Check password meets minimum requirements (8 chars)

## Related Documentation

- [Appwrite Migration Guide](./appwrite-migration.md)
- [Appwrite Official Docs](https://appwrite.io/docs)
- [MCP Protocol](https://modelcontextprotocol.io/)


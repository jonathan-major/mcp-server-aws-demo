# MCP Server AWS Demo

This is a demo server using the Model Context Protocol (MCP) for integration with Cursor. It provides tools to get workspace information and fetch logs from AWS CloudWatch.

## Prerequisites

- Node.js installed
- An AWS account with access to CloudWatch Logs
- AWS credentials configured (via environment variables or AWS CLI)

## Installation

1. Clone this repository:
   ```bash
   git clone <your-repo-url>
   cd mcp-server-aws-demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Set the following environment variables:

- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key
- `AWS_SESSION_TOKEN`: Your AWS session token
- `AWS_REGION`: Your AWS region (e.g., 'us-east-2')
- `DEFAULT_LOG_GROUP`: (Optional) Default CloudWatch log group name. If not set, you must always specify `logGroupName` when calling the tool.

## Adding to Cursor

To use this MCP server in Cursor, you need to configure it in your project's MCP settings. Cursor will automatically start and manage the server process for you.

### Option 1: Project-Specific Configuration (Recommended)

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to "Tools & Integrations" 
3. Scroll down to the "MCP Tools" section
4. Click "Add Custom MCP"
5. This will create or edit a `.cursor/mcp.json` file in your project root
6. Add the following configuration:
   ```json
   {
     "mcpServers": {
       "aws-demo": {
         "command": "node",
         "args": ["server.js"],
         "cwd": "/path/to/your/mcp-server-aws-demo",
         "env": {
           "AWS_ACCESS_KEY_ID": "your-access-key",
           "AWS_SECRET_ACCESS_KEY": "your-secret-key",
           "AWS_SESSION_TOKEN": "your-session-token",
           "AWS_REGION": "your-region",
           "DEFAULT_LOG_GROUP": "your-default-log-group"
         }
       }
     }
   }
   ```
7. Replace `/path/to/your/mcp-server-aws-demo` with the actual path to this project
8. Replace the AWS credentials and region with your actual values
9. Reload the Cursor window for the changes to take effect

### Option 2: Global Configuration

Alternatively, you can configure the MCP server globally by editing `~/.cursor/mcp.json` with the same configuration.

## Troubleshooting

### MCP Tools Not Appearing
- Ensure Cursor has been restarted or the window reloaded
- Check that the `cwd` path in your MCP configuration matches your actual project location
- Verify AWS credentials are valid and not expired
- Check the MCP Tools section in Cursor settings for any error indicators

### AWS Credentials Issues
- Make sure your AWS session token hasn't expired
- Verify you have the necessary CloudWatch Logs permissions
- Test credentials manually: `aws logs describe-log-groups --region your-region`

### Server Connection Issues
- The MCP server should show as enabled in Cursor's MCP Tools section
- If it shows "No tools or prompts", try reloading the Cursor window
- Check that all dependencies are installed: `npm install`

## Tools Available

### get_cursor_workspace_info
- Description: Get basic Cursor workspace information
- Input: None
- Output: Text with current working directory and timestamp

### get_cloudwatch_logs
- Description: Get live log trails from AWS CloudWatch
- Input:
  - logGroupName: string (optional if DEFAULT_LOG_GROUP is set)
  - logStreamName: string (optional)
  - startTime: string (ISO format, optional)
  - endTime: string (ISO format, optional)
  - limit: number (optional, default 100)
- Output: Text with formatted log events

## Project Structure

```
mcp-server-aws-demo/
├── server.js                 # Main MCP server implementation
├── package.json              # Node.js dependencies and project metadata
├── package-lock.json         # Locked dependency versions
├── README.md                 # This documentation file
├── .gitignore               # Git ignore rules for Node.js and MCP projects
├── .cursor/
│   └── mcp.json            # Project-specific MCP configuration (not tracked in Git)
├── node_modules/            # Installed dependencies (not tracked in Git)
└── .git/                    # Git repository metadata
```

### File Descriptions

- **`server.js`**: The main MCP server that implements the CloudWatch logs and workspace info tools
- **`package.json`**: Defines project dependencies (`@modelcontextprotocol/sdk` and `@aws-sdk/client-cloudwatch-logs`)
- **`package-lock.json`**: Ensures consistent dependency versions across installations
- **`README.md`**: Complete setup and usage documentation
- **`.gitignore`**: Excludes sensitive files (AWS credentials, node_modules, system files)
- **`.cursor/mcp.json`**: Local MCP configuration with AWS credentials (excluded from Git for security)
- **`node_modules/`**: Contains installed npm packages (excluded from Git)

## Usage Examples

Once configured, you can use the AWS CloudWatch tools directly in your Cursor conversations:

- "Show me the latest CloudWatch logs"
- "Get logs from my Lambda function"
- "Check the logs from the past hour"


#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  {
    name: 'my-workspace-server',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the tools
const tools = [
  {
    name: 'get_cursor_workspace_info',
    description: 'Get basic Cursor workspace information',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_cloudwatch_logs',
    description: 'Get live log trails from AWS CloudWatch',
    inputSchema: {
      type: 'object',
      properties: {
        logGroupName: {
          type: 'string',
          description: 'The name of the CloudWatch log group',
        },
        logStreamName: {
          type: 'string',
          description: 'The name of the CloudWatch log stream (optional)',
        },
        startTime: {
          type: 'string',
          description: 'Start time in ISO format (optional, defaults to 1 hour ago)',
        },
        endTime: {
          type: 'string',
          description: 'End time in ISO format (optional, defaults to now)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of log events to return (optional, defaults to 100)',
        },
      },
      required: [],
    },
  },
];

// Handle tools/list
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tools/call
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name } = request.params;
  
  if (name === 'get_cursor_workspace_info') {
    return {
      content: [
        {
          type: 'text',
          text: `Workspace: ${process.cwd()}\nTime: ${new Date().toISOString()}`,
        },
      ],
    };
  }
  
  if (name === 'get_cloudwatch_logs') {
    try {
      const { logGroupName, logStreamName, startTime, endTime, limit = 100 } = request.params.arguments || {};

      const effectiveLogGroup = logGroupName || process.env.DEFAULT_LOG_GROUP;
      if (!effectiveLogGroup) {
        return {
          content: [
            {
              type: 'text',
              text: 'logGroupName is required or set DEFAULT_LOG_GROUP environment variable.',
            },
          ],
        };
      }

      // Import AWS SDK
      const { CloudWatchLogsClient, FilterLogEventsCommand } = await import('@aws-sdk/client-cloudwatch-logs');

      const client = new CloudWatchLogsClient({});

      // Calculate time range
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const startTimeMs = startTime ? new Date(startTime).getTime() : oneHourAgo.getTime();
      const endTimeMs = endTime ? new Date(endTime).getTime() : now.getTime();

      const command = new FilterLogEventsCommand({
        logGroupName: effectiveLogGroup,
        logStreamNames: logStreamName ? [logStreamName] : undefined,
        startTime: startTimeMs,
        endTime: endTimeMs,
        limit,
      });

      const response = await client.send(command);

      const logs = response.events || [];
      const logText = logs.map(event => 
        `[${new Date(event.timestamp).toISOString()}] ${event.message}`
      ).join('\n');
      
      return {
        content: [
          {
            type: 'text',
            text: `CloudWatch Logs for ${effectiveLogGroup}:\n\n${logText || 'No logs found in the specified time range.'}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error fetching CloudWatch logs: ${error.message}`,
          },
        ],
      };
    }
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Connect to transport
const transport = new StdioServerTransport();
await server.connect(transport);

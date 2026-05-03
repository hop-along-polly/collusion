# Intro to MCP

The Model Context Protocol is a communication layer that allows the Model to access context and tools without needing custom code. Anyone can create an MCP server, but it is common for service providers (i.e. SaaS companies like Github, DropBox etc.) to provide an official MCP server.

MCP uses the standard Client-Server architecture.
 - `Server`: A service written by a 3rd party that wraps an outside service (i.e. Github, Jira etc). The server provides `tools`, `resources` and `prompts` for working with that outside service.
 - `Client`: An app/agent/script that accesses the `tools`, `resources`, and `prompts` (see [MCP Primitives](#mcp-primitives) below) provided by the MCP server. These are usually a library or API.

MCP Client -> Server communication can use many different protocols. Common ones are
 - Standard IO: Only when the client and server are running on the same system
 - HTTP(s)
 - Websockets

## MCP Primitives

The MCP protocol defines 3 primitives that are core objects provided by the MCP server that help make agents more useful. Each of the primitives listed below are used by different components of an agentic app.

 - `tools`: Are functions (actions) the MCP Server can take on behalf of the client. Similar to the relationship a Model has with tool functions. Ref [Tool Use](#tool-use)
  - tools are considered `model controlled` because the Model chooses when to use them
 - `resources`: Define what data the MCP Server can provide. think of this as anything that would be returned by a GET endpoint in a RESTful API.
  - resources are considered `app controlled` because the agent/app primarily controls when to use them.
 - `prompts`: Are the pre-defined prompt templates that can be invoked by the client. These are essentially slash commands (i.e. `/init`, `/remote-control` etc.) that are available in claude code.
  - prompts are considered to be `user controlled` because the user chooses when to use them (i.e. by running `/<prompt-name>`).

**NOTE: `prompts` in an MCP server truly are templates becuase the prompt may be static but they support passing in specific information like `resource` references that customize the prompt for a specific use case.**

There are 2 types of `resources` in an MCP server.
 - `direct`: The resources URI is static and contains no parameters (i.e an S3 Object url)
 - `templated`: The URI contains 1+ parameters(i.e REST API Get endpoints like `/account/<acctId>/invoice/<invId>`)


## MCP SDK Request Types

The following are some of the common SDK requests (actions) used when working with an MCP Server.
 - `InitializeRequest`: Initial handshake between MCP Client and Server
 - `ListToolsRequest`: Get a list of all the `tools` the MCP server provides. The server responds with a `ListToolsResult` containing the schemas for all of its tools.
 - `CallToolRequest`: Calls a specific tool and provides inputs. The server responds with a `CallToolResult` containing the results from that tools execution.
 - `ListResourcesRequest`: List all of the resources (data) the MCP can provide
 - `ReadResourceRequest`: Reads the actual content of a specific resource making it available to the agent.
 - `ListPromptsRequest`: Lists available prompt templates provided by the MCP Server.

## Creating an MCP Server

**NOTE: When building an MCP server it is recommended to use the official [MCP SDK](https://github.com/modelcontextprotocol/python-sdk).**

**MCP Inspector**: Is a tool included with the official MCP SDK and can be used to verify the `tools`, `resources` and `prompts` defined by the MCP server are working as expected. This is a debugging/development tool it does not replace unit, or integration tests.

## Implementing an MCP Client

To talk to an MCP Server an app/agent/script needs to create a session with the MCP server. the official MCP SDK provides a `session` interface which is the actual connection to the MCP Server and used for all communiction between the MCP Server and client application. Primarily the client will be providing an interface for calling the [MCP SDK Request Types](#mcp-sdk-request-types).

**Note: It is a best practice to create an MCPClient class that wraps the MCP Session to make session management easier.**

# Language Server WebSocket Bridge

## Overview
This script provides a WebSocket bridge to interface multiple Language Servers (e.g., `svelte-language-server`, `pylsp`, `gopls`, `clangd`, etc.) with clients via a single WebSocket connection. It supports various language servers concurrently and handles language-specific file extensions and initialization parameters.

## Features
- Supports multiple language servers concurrently.
- Easy language server configuration and initialization parameter modification.
- Error handling and logging for language server processes.
- Utilizes `vscode-jsonrpc` for LSP message handling.
- Support for IPC and stdio communication with language servers.
- Automatic file URI translation between server and client paths.
- Temporary file creation for `textDocument/didOpen` events.

## Usage

1. Install Node.js and the required language servers.
2. Configure the desired language servers in `defaultServers.js`.
3. Run the script: `node index.js`.
4. Connect to the WebSocket server on `ws://localhost:3030/<language_endpoint>`.
5. Transmit LSP messages via the WebSocket connection.

## Configuration

Add or modify language server configurations in `defaultServers.js`:

```javascript
exports.servers = [
   {
       endpointName: "language_endpoint", // WebSocket endpoint name
       args: ['executable_path', ['arg1', 'arg2', ...]],
       nameEndsWith: ".file_extension",
       connectionType: "ipc" | "stdio", // Communication type
       relativePath: true | false, // Whether to use relative paths
       serverFileNameReplacePattern: { // Server file name regex replacements
           from: /pattern/,
           to: "replacement"
       },
       clientFileNameReplacePattern: { // Client file name regex replacements
           from: /pattern/,
           to: "replacement"
       }
   }
   // Add more language server configurations here
];

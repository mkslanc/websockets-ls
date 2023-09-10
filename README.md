# Language Server WebSocket Bridge

## Overview
Provides a WebSocket bridge to interface multiple Language Servers (e.g., `svelte-language-server` and `pylsp`) with clients via a single WebSocket connection.

## Features
- Supports multiple language servers concurrently.
- Easy initialization parameter modification.
- Error handling for language server processes.
- Utilizes `vscode-jsonrpc` for LSP message handling.

## Usage

1. Install Node.js and the required language servers.
2. Run the script: `node <script_path>`.
3. Connect to the WebSocket server on `ws://localhost:3030`.
4. Transmit LSP messages via the WebSocket connection.

## Configuration

Add more servers with:

```javascript
const servers = [
    // ... previous configurations
    {
        args: ['executable_path', ['arg1', 'arg2', ...]],
        nameEndsWith: ".file_extension"
    }
];
```

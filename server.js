const WebSocket = require('ws');
const {spawn} = require('child_process');
const url = require('url');
const {
    StreamMessageReader,
    StreamMessageWriter,
    IPCMessageReader,
    IPCMessageWriter
} = require('vscode-jsonrpc');
const fs = require('fs');
const path = require("path");
const {
    makeServerPath,
    makeClientPath,
    formatPath
} = require("./paths-utility");


const servers = [
    {
        args: [
            'node', [require.resolve('svelte-language-server/bin/server.js')], {
                env: Object.create(process.env),
                stdio: [null, null, null, 'ipc']
            }
        ],
        nameEndsWith: ".html",
        connectionType: "ipc",
        relativePath: true
    }, {
        args: ["pylsp"],
        nameEndsWith: ".python",
        connectionType: "stdio",
        relativePath: false
    }, {
        args: [
            'node', [require.resolve('@astrojs/language-server/bin/nodeServer.js'), "--stdio"]
        ],
        nameEndsWith: ".astro",
        connectionType: "stdio",
        relativePath: false
    }, {
        args: [
            'gopls', ['-mode=stdio', '-remote=auto']
        ],
        nameEndsWith: ".golang",
        connectionType: "stdio",
        relativePath: true
    } //add any other language servers here
];

function handleLanguageConnection(ws, extension) {
    const server = servers.find(server => server.nameEndsWith === extension);
    setUpLanguageServer(ws, server);
}

const wss = new WebSocket.Server({port: 3030});

wss.on('connection', (ws, req) => {
    const pathname = url.parse(req.url).pathname;

    switch (pathname) {
        case "/svelte":
            handleLanguageConnection(ws, ".html");
            break;
        case "/astro":
            handleLanguageConnection(ws, ".astro");
            break;
        case "/python":
            handleLanguageConnection(ws, ".python");
            break;
        case "/go":
            handleLanguageConnection(ws, ".golang");
            break;
        default:
            ws.close();
            break;
    }
});

function processMessage(message, ws) {
    if (message.params) {
        if (message.params.textDocument && message.params.textDocument.uri) {
            message.params.textDocument.uri = makeClientPath(message.params.textDocument.uri);
        }
        else if (message.params.uri) {
            message.params.uri = makeClientPath(message.params.uri);
        }
    }
    ws.send(JSON.stringify(message));
}

function handleMessage(parsed, server) {
    if (parsed.method) {
        switch (parsed.method) {
            case "initialize":
                let rootUri = formatPath(__dirname);
                parsed.params.rootUri = rootUri;
                parsed.params.rootPath = __dirname;
                /* parsed.params.workspaceFolders = [
                     {
                         uri: rootUri,
                         name: __dirname
                     }
                 ];*/
                if (!parsed.params.initializationOptions) {
                    parsed.params.initializationOptions = {};
                }
                break;
            case "textDocument/didOpen":
                if (!fs.existsSync("temp")) {
                    fs.mkdirSync("temp");
                }
                fs.writeFileSync("temp" + path.sep + parsed.params.textDocument.uri, parsed.params.textDocument.text);
                break;
        }

    }
    if (parsed.params && parsed.params.textDocument && parsed.params.textDocument.uri) {
        parsed.params.textDocument.uri = makeServerPath(parsed.params.textDocument.uri);
        if (server && server.relativePath) {
            parsed.params.textDocument.uri = parsed.params.textDocument.uri.replace(__dirname + path.sep, "");
        }
    }
    const writer = server?.writer;
    if (writer) {
        writer.write(parsed);
    }
}

function setUpLanguageServer(ws, server) {
    if (!server) return;

    const {
        reader,
        writer
    } = startLsServer(server);
    server.writer = writer;

    reader.listen(message => {
        if (message.error) {
            console.error(server.nameEndsWith + ":");
            console.log(message.error);
            return;
        }
        processMessage(message, ws);
    });

    ws.on('message', message => {
        let parsed = JSON.parse(message);
        handleMessage(parsed, server);
    });
}

function startLsServer(languageServer) {
    let env = process.env;
    const serverProcess = spawn(...languageServer.args, {env});
    serverProcess.stderr.on('data', data => {
        console.error(`${serverProcess.spawnfile} error: ${data}`);
    });

    serverProcess.on('exit', code => {
        //clear files from temp directory
        fs.readdirSync("temp").forEach(file => {
            fs.unlinkSync("temp" + path.sep + file);
        });
        console.log(`${serverProcess.spawnfile} exited with code ${code}`);
    });

    serverProcess.on('error', err => {
        console.error(`Failed to start ${serverProcess.spawnfile}:```, err);
    });

    let reader;
    let writer;

    switch (languageServer.connectionType) {
        case "ipc":
            reader = new IPCMessageReader(serverProcess);
            writer = new IPCMessageWriter(serverProcess);
            break;
        /*case "socket":
            reader = new rpcNode.SocketMessageReader(this.socket)
            writer = new rpcNode.SocketMessageWriter(this.socket)
            break*/
        case "stdio":
            if (serverProcess.stdin !== null && serverProcess.stdout !== null) {
                reader = new StreamMessageReader(serverProcess.stdout);
                writer = new StreamMessageWriter(serverProcess.stdin);
            }
            else {
                throw 'The language server process does not have a valid stdin and stdout';
            }
            break;
        default:
            throw 'Uknown connection type';
    }

    return {
        reader,
        writer
    };
}

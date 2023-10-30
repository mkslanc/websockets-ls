const WebSocket = require('ws');
const {spawn} = require('child_process');
const {
    StreamMessageReader,
    StreamMessageWriter,
    IPCMessageReader,
    IPCMessageWriter
} = require('vscode-jsonrpc');
const fs = require('fs');
const path = require("path");


const servers = [
    {
        args: ['node', [require.resolve('svelte-language-server/bin/server.js')], {
            env: Object.create(process.env),
            stdio: [null, null, null, 'ipc'],
        }],
        nameEndsWith: ".html",
        connectionType: "ipc",
        relativePath: true
    }, {
        args: ["pylsp"],
        nameEndsWith: ".python",
        connectionType: "stdio"
    }, //add any other language servers here
];

const wss = new WebSocket.Server({port: 3030});

wss.on('connection', ws => {
    servers.forEach(server => {
        const {
            reader,
            writer
        } = startLsServer(server);
        server.writer = writer;

        reader.listen(message => {
            if (message.error) {
                console.log(message.error);
                return;
            }
            if (message.params) {
                if (message.params.textDocument && message.params.textDocument.uri) {
                    message.params.textDocument.uri = makeClientPath(message.params.textDocument.uri);
                }
                else if (message.params.uri) {
                    message.params.uri = makeClientPath(message.params.uri);
                }

            }
            ws.send(JSON.stringify(message));
        });
    });
    ws.on('message', message => {
        let parsed = JSON.parse(message);
        if (parsed.method) {
            switch (parsed.method) {
                case "initialize":
                    parsed.params.rootUri = __dirname;
                    break;
                case "textDocument/didOpen":
                    if (!fs.existsSync("temp")) {
                        fs.mkdirSync("temp");
                    }
                    fs.writeFileSync("temp" + path.sep + parsed.params.textDocument.uri, parsed.params.textDocument.text);
                    break;
                case "completionItem/resolve": { //workaround to determine server
                    parsed.params.textDocument = {
                        uri: parsed.params.data.aceFileName
                    }
                    break;
                }
            }

        }
        if (!(parsed.params && parsed.params.textDocument && parsed.params.textDocument.uri)) {
            servers.forEach(server => {
                server.writer.write(parsed);
            });
            return;
        }
        else {
            parsed.params.textDocument.uri = makeServerPath(parsed.params.textDocument.uri);
        }
        const server = servers.find(server => parsed.params.textDocument.uri.endsWith(server.nameEndsWith));
        if (server && server.relativePath) {
            parsed.params.textDocument.uri = parsed.params.textDocument.uri.replace(__dirname + path.sep, "");
        }
        const writer = server?.writer;
        if (writer) {
            writer.write(parsed);
        }
    });

});


function startLsServer(languageServer) {
    const serverProcess = spawn(...languageServer.args);
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

function makeServerPath(fileName) {
    return formatPath(__dirname + path.sep + "temp" + path.sep + fileName);
}

function makeClientPath(filePath) {
    return filePath.split(/[/\\]/).pop()
}

function formatPath(filePath) {
    return path.normalize(filePath);    
}

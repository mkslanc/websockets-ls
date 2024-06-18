exports.servers = [
    {
        endpointName: "svelte",
        args: [
            'node', [require.resolve('svelte-language-server/bin/server.js')], {
                env: Object.create(process.env),
                stdio: [null, null, null, 'ipc']
            }
        ],
        nameEndsWith: ".text",
        connectionType: "ipc",
        relativePath: true
    }, {
        endpointName: "python",
        args: ["pylsp"],
        nameEndsWith: ".python",
        connectionType: "stdio",
        relativePath: false
    }, {
        endpointName: "astro",
        args: [
            'node', [require.resolve('@astrojs/language-server/bin/nodeServer.js'), "--stdio"]
        ],
        nameEndsWith: ".astro",
        connectionType: "stdio",
        relativePath: false
    }, {
        endpointName: "go",
        args: [
            'gopls', ['-mode=stdio', '-remote=auto']
        ],
        nameEndsWith: ".golang",
        connectionType: "stdio",
        relativePath: false,
        serverFileNameReplacePattern: {
            from: /.golang$/,
            to: ".go"
        },
        clientFileNameReplacePattern: {
            from: /.go$/,
            to: ".golang"
        },
    }, {
        endpointName: "c",
        args: [
            'clangd', ['--log=error']
        ],
        nameEndsWith: ".c",
        connectionType: "stdio"
    }, {
        endpointName: "r",
        args: [
            'r', ['--slave', '-e', 'languageserver::run()']
        ],
        nameEndsWith: ".r",
        connectionType: "stdio",
        relativePath: false
    }, {
        endpointName: "lsp-ai",
        args: [
            "lsp-ai"
        ],
        nameEndsWith: ".js",
        connectionType: "stdio",
        relativePath: false
    }//add any other language servers here
];

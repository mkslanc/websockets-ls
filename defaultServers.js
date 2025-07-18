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
        relativePath: false

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
    }, {
        endpointName: "typescript",
        args: [
            'typescript-language-server', ['--stdio']
        ],
        nameEndsWith: ".ts",
        connectionType: "stdio",
        relativePath: false
    }, {
        endpointName: "vue",
        args: [
            'node', [require.resolve('@vue/language-server/bin/vue-language-server.js'), "--stdio"]
        ],
        nameEndsWith: ".vue",
        connectionType: "stdio",
        relativePath: false
    }, {
        endpointName: "copilot",
        args: [
            'node', [require.resolve('@github/copilot-language-server/dist/language-server.js'), "--stdio"]
        ],
        nameEndsWith: ".copilot",
        connectionType: "stdio",
        relativePath: false
    }, {
        endpointName: "dart",
        args: [
            'dart', ['language-server --client-id ace-linters.dart --client-version 1.2']
        ],
        nameEndsWith: ".dart",
        connectionType: "stdio",
        relativePath: false
    }//add any other language servers here
];

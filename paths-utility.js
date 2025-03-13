const path = require("path");
const {URI} = require("vscode-uri");

/**
 * 
 * @param {string} fileName
 * @param replacement
 * @return {*}
 */
function makeServerPath(fileName, replacement) {
    if (fileName.startsWith("file:")) {
       return fileName;
    }
    const serverPath = formatPath(__dirname + path.sep + "temp" + path.sep + fileName);
    if (replacement){
        return serverPath.replace(replacement.from, replacement.to);
    }
    return serverPath;
}

function makeClientPath(filePath, replacement) {
    if (/^(file|https?):/.test(filePath)) {
        return filePath;
    }
    const clientPath = filePath.split(/[/\\]/).pop();
    if (replacement){
        return clientPath.replace(replacement.from, replacement.to);
    }
    return clientPath;
}

function formatPath(filePath) {
    return URI.file(filePath).toString();
}

exports.makeServerPath = makeServerPath;
exports.makeClientPath = makeClientPath;
exports.formatPath = formatPath;

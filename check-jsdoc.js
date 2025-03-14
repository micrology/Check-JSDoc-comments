const fs = require("fs");
const path = require("path");
const espree = require("espree");
const estraverse = require("estraverse");

// Get command line arguments
const args = process.argv.slice(2);
const typeIndex = args.indexOf("--type");

// Determine the parsing mode (default is "script")
const parseType = (typeIndex !== -1 && args[typeIndex + 1]) || "script";

// Get the path (file or directory) from the command line
const targetPath = args.find(arg => arg !== "--type" && arg !== "script" && arg !== "module");

if (!targetPath) {
    console.error("Usage: node check-jsdoc.js --type [script|module] <file-or-directory>");
    process.exit(1);
}


// Function to check JSDoc comments in a file
function checkJSDoc(filePath) {
    const code = fs.readFileSync(filePath, "utf-8");
    const ast = espree.parse(code, { comment: true, loc: true, ecmaVersion: "latest", sourceType: "module" });
    const comments = ast.comments || [];

    function hasJSDocComment(node) {
        return comments.some(comment =>
            comment.type === "Block" &&
            comment.value.startsWith("*") &&
            comment.loc.end.line === node.loc.start.line - 1
        );
    }

    const functionsWithoutJSDoc = [];

    estraverse.traverse(ast, {
        enter: (node) => {
            if (node.type === "FunctionDeclaration" ||
                node.type === "FunctionExpression" ||
                node.type === "ArrowFunctionExpression") {

                if (!hasJSDocComment(node)) {
                    // skip checking anonymous functions
                    // const functionName = node.id ? node.id.name : "(anonymous)";
                    if (node.id) {
                        functionsWithoutJSDoc.push({
                            name: node.id.name,
                            line: node.loc.start.line,
                        });
                    }
                }
            }
        }
    });

    if (functionsWithoutJSDoc.length > 0) {
        console.log(`\nFile: ${path.basename(filePath)}`);
        functionsWithoutJSDoc.forEach(fn =>
            console.log(`- ${fn.name} (Line ${fn.line})`));
    }
}

// Function to scan a directory for JavaScript files
function scanDirectory(dir) {
    if (!fs.existsSync(dir)) {
        console.error(`Error: Directory '${dir}' does not exist.`);
        process.exit(1);
    }

    const jsFiles = fs.readdirSync(dir)
        .filter(file => file.endsWith(".js"))
        .map(file => path.join(dir, file));

    if (jsFiles.length === 0) {
        console.log(`No JavaScript files found in '${dir}'`);
        return;
    }

    console.log(`Scanning directory: ${dir}`);
    jsFiles.forEach(checkJSDoc);
}

// Main code
console.log("JSDoc Comments Checker\nLists functions without JSDoc comments in JavaScript files.");
// Check if target is a file or directory
if (fs.existsSync(targetPath)) {
    if (fs.statSync(targetPath).isDirectory()) {
        scanDirectory(targetPath);
    } else {
        checkJSDoc(targetPath);
    }
} else {
    console.error(`Error: '${targetPath}' does not exist.`);
    process.exit(1);
}
#!/usr/bin/env node
import chokidar from 'chokidar';
import { getAllFiles, getFileContent, renameFile, writeFile } from './tools/file-utils';
import * as fs from 'fs';
import * as path from 'path';

// Get version from package.json
const getVersion = (): string => {
    try {
        const packageJsonPath = path.join(__dirname, '..', 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        return packageJson.version || 'unknown';
    } catch {
        return 'unknown';
    }
};

interface Config {
    name: string;
    version: string;
    root: string;
    files: string[];
    excludes: string[];
    replacements: Array<{
        regex: boolean;
        old: string;
        new: string;
    }>;
    renameOnly?: boolean;
}

interface ParsedArgs {
    configPath: string;
    renameOnly: boolean;
}

const parseArgs = (): ParsedArgs => {
    const args = process.argv.slice(2);
    let configPath = '';
    let renameOnly = false;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-c' || args[i] === '--config') {
            configPath = args[i + 1] || '';
            i++;
        } else if (args[i] === '-h' || args[i] === '--help') {
            showHelp();
            process.exit(0);
        } else if (args[i] === '-v' || args[i] === '--version') {
            console.log(`namechanger v${getVersion()}`);
            process.exit(0);
        } else if (args[i] === '-r' || args[i] === '--rename-only') {
            renameOnly = true;
        }
    }

    if (!configPath) {
        console.error('Error: Please provide configuration file path');
        console.error('Usage: namechanger -c <config.json>');
        console.error('Use -h or --help for help');
        process.exit(1);
    }

    return { configPath, renameOnly };
};

const showHelp = () => {
    console.log(`
NameChanger - Batch file renaming and content replacement tool

Usage:
  namechanger -c <config.json>
  namechanger --config <config.json>

Options:
  -c, --config <path>   Specify configuration file path
  -h, --help            Show help information
  -v, --version         Show version number
  -r, --rename-only     Only rename files, do not replace file content

Configuration format:
  {
    "name": "project name",
    "version": "1.0.0",
    "root": "target directory path",
    "files": [".sln", ".ts", ".js"],
    "excludes": ["node_modules", ".git"],
    "renameOnly": false,
    "replacements": [
      { "regex": false, "old": "old text", "new": "new text" },
      { "regex": true, "old": "regex pattern", "new": "replacement text" }
    ]
  }

Note: renameOnly can be set in config file or via -r/--rename-only command line option.
`);
};

const loadConfig = (configPath: string): Config => {
    const fullPath = path.resolve(configPath);
    if (!fs.existsSync(fullPath)) {
        console.error(`Error: Configuration file does not exist: ${fullPath}`);
        process.exit(1);
    }
    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return JSON.parse(content) as Config;
    } catch (err) {
        console.error(`Error: Failed to parse configuration file: ${err}`);
        process.exit(1);
    }
};

const validateConfig = (config: Config): void => {
    if (!config.root) {
        console.error('Error: Missing root field in configuration file');
        process.exit(1);
    }

    const rootPath = path.resolve(config.root);
    if (!fs.existsSync(rootPath)) {
        console.error(`Error: Specified root directory does not exist: ${rootPath}`);
        console.error('Please check if the root path in configuration file is correct');
        process.exit(1);
    }

    const stats = fs.statSync(rootPath);
    if (!stats.isDirectory()) {
        console.error(`Error: Specified root path is not a directory: ${rootPath}`);
        process.exit(1);
    }

    if (!config.files || config.files.length === 0) {
        console.error('Error: Missing files field or empty array in configuration file');
        process.exit(1);
    }

    if (!config.replacements || config.replacements.length === 0) {
        console.error('Error: Missing replacements field or empty array in configuration file');
        process.exit(1);
    }
};

const { configPath, renameOnly: cmdRenameOnly } = parseArgs();
const config = loadConfig(configPath);
validateConfig(config);

// Command line option takes precedence over config file
const renameOnly = cmdRenameOnly || config.renameOnly || false;

const contentReplace = (srcValue: string, oldValue: string, newValue: string, isRegex: boolean): string => {
    if (isRegex) {
        return srcValue.replace(new RegExp(oldValue, 'g'), newValue);
    } else {
        return srcValue.replaceAll(oldValue, newValue);
    }
}
const fileRename = async (allFiles: string[]) => {
    let newFiles: string[] = [];
    for (let i = 0; i < allFiles.length; i++) {
        let filePath = allFiles[i];
        let newPath = filePath;
        for (let j = 0; j < config.replacements.length; j++) {
            newPath = contentReplace(newPath, config.replacements[j].old, config.replacements[j].new, config.replacements[j].regex);
        }
        if (newPath != filePath) {
            console.log('Renaming file:', filePath, '==>', newPath);
            await renameFile(filePath, newPath, { overwrite: true })
        }
        newFiles.push(newPath);
    }
    return newFiles;
}

const fileContentReplace = (allFiles: string[]) => {
    for (let i = 0; i < allFiles.length; i++) {
        let filePath = allFiles[i];
        for (let i = 0; i < config.replacements.length; i++) {
            let content = getFileContent(filePath);
            let newContent = contentReplace(content, config.replacements[i].old, config.replacements[i].new, config.replacements[i].regex)
            console.log('Replacing content in file:', filePath);
            writeFile(filePath, newContent);
        }
    }
}
const start = async () => {
    var watchExt: string[] = [];
    for (let i = 0; i < config.files.length; i++) {
        let exts = config.files[i];
        watchExt.push(exts);
    }
    watchExt = [...new Set(watchExt)];
    // Initialize watcher.
    const allFiles = getAllFiles(config.root, watchExt,
        config.excludes
    );

    let newFiles = await fileRename(allFiles);

    if (!renameOnly) {
        fileContentReplace(newFiles);
    } else {
        console.log('Skipping content replacement (rename-only mode)');
    }
}

start().then(()=>{
     console.log(renameOnly ? 'File renaming completed' : 'Replacement completed')
});
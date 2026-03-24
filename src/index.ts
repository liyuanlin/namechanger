#!/usr/bin/env node
import chokidar from 'chokidar';
import { getAllFiles, getFileContent, renameFile, writeFile } from './tools/file-utils';
import * as fs from 'fs';
import * as path from 'path';

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
}

const parseArgs = (): { configPath: string } => {
    const args = process.argv.slice(2);
    let configPath = '';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '-c' || args[i] === '--config') {
            configPath = args[i + 1] || '';
            i++;
        } else if (args[i] === '-h' || args[i] === '--help') {
            showHelp();
            process.exit(0);
        }
    }

    if (!configPath) {
        console.error('错误: 请提供配置文件路径');
        console.error('用法: namechanger -c <config.json>');
        console.error('使用 -h 或 --help 查看帮助');
        process.exit(1);
    }

    return { configPath };
};

const showHelp = () => {
    console.log(`
NameChanger - 文件批量重命名和内容替换工具

用法:
  namechanger -c <config.json>
  namechanger --config <config.json>

选项:
  -c, --config <路径>  指定配置文件路径
  -h, --help           显示帮助信息

配置文件格式:
  {
    "name": "项目名称",
    "version": "1.0.0",
    "root": "目标目录路径",
    "files": ["".sln", ".ts", ".js"],
    "excludes": ["node_modules", ".git"],
    "replacements": [
      { "regex": false, "old": "旧文本", "new": "新文本" },
      { "regex": true, "old": "正则模式", "new": "替换文本" }
    ]
  }
`);
};

const loadConfig = (configPath: string): Config => {
    const fullPath = path.resolve(configPath);
    if (!fs.existsSync(fullPath)) {
        console.error(`错误: 配置文件不存在: ${fullPath}`);
        process.exit(1);
    }
    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return JSON.parse(content) as Config;
    } catch (err) {
        console.error(`错误: 无法解析配置文件: ${err}`);
        process.exit(1);
    }
};

const { configPath } = parseArgs();
const config = loadConfig(configPath);
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
            console.log('重命名文件：', filePath, '==>', newPath);
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
            console.log('替换文件', filePath);
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
    fileContentReplace(newFiles);
} 

start().then(()=>{
     console.log('替换完成')
});
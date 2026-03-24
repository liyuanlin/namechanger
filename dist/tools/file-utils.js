"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileExtension = getFileExtension;
exports.getAllFiles = getAllFiles;
exports.getFileContent = getFileContent;
exports.writeFile = writeFile;
exports.englishToKeyword = englishToKeyword;
exports.renameFile = renameFile;
const fs_1 = __importDefault(require("fs"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
function getFileExtension(filename) {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1)
        return ''; // 如果没有找到'.'，返回空字符串
    return '.' + filename.substring(lastDotIndex + 1).toLocaleLowerCase();
}
/**
 * 遍历指定目录的全部文件，同时忽略指定的目录
 * @param dirPath 要遍历的目录路径
 * @param ignoreDirs 要忽略的目录列表
 * @returns 文件路径的数组
 */
function getAllFiles(dirPath, exts, ignoreDirs = ['node_modules']) {
    let files = [];
    const readDirectory = (dir) => {
        const items = fs_1.default.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path_1.default.join(dir, item.name);
            if (item.isDirectory()) {
                // 如果目录在忽略列表中，则跳过
                if (ignoreDirs.includes(item.name)) {
                    continue;
                }
                // 递归读取子目录
                readDirectory(fullPath);
            }
            else if (item.isFile()) {
                // 收集文件路径
                var ext = getFileExtension(item.name);
                if (exts.indexOf(ext) !== -1)
                    files.push(fullPath);
            }
        }
    };
    readDirectory(dirPath);
    return files;
}
function getFileContent(path) {
    return fs_1.default.readFileSync(path, 'utf8');
}
function writeFile(path, content) {
    fs_1.default.writeFileSync(path, content, 'utf8');
}
function textToCamelCaseVariable(text) {
    let fullText = text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '_') // 非字母数字替换为下划线
        .replace(/^_+/, '') // 移除开头的下划线
        .replace(/_+$/, '') // 移除结尾的下划线
        .replace(/_+([a-z])/g, (_, c) => c.toUpperCase()) // 下划线后字母大写
        .replace(/^(\d)/, '_$1') // 数字开头前面加下划线
        || 'text'; // 确保非空
    if (fullText.length > 10) {
        for (let i = 0; i < fullText.length; i++) {
            if (fullText[i] == '_') {
                fullText = fullText.substring(0, i) + fullText.substring(i + 1);
            }
        }
    }
    return fullText;
}
function englishToKeyword(filePath, english) {
    let removeWords = ['pages', 'views', 'components'];
    let replaceToWords = ['page', 'view', 'component'];
    // 1. 获取文件名（不带扩展名） 和目录
    const { name, dir } = path_1.default.parse(filePath);
    let dirValues = dir.replaceAll('\\', '/').split('/');
    // 2. 从目录中找到有总结意义的词语
    let selectedPart = [];
    for (let i = dirValues.length - 1; i >= 0; i--) {
        let found = false;
        var partValue = dirValues[i].toLowerCase()
            .replace(/[^a-zA-Z0-9_]/g, '_') // 替换所有非字母数字字符为下划线
            .replace(/^_+/, '') // 移除开头的下划线
            .replace(/_+$/, '') // 移除结尾的下划线
            .replace(/_+/g, '_'); // 将多个连续下划线合并为一个;
        if (/^[0-9]/.test(partValue)) {
            continue;
        }
        if (partValue == 'src') { //可能还有其他的上溯到根目录的情况，这里暂时只出来到了src目录
            break;
        }
        for (let j = 0; j < removeWords.length; j++) {
            const element = removeWords[j];
            if (partValue == element) {
                selectedPart.push(replaceToWords[j]);
                found = true;
                break;
            }
        }
        if (!found) {
            selectedPart.push(partValue);
        }
        if (selectedPart.length > 1)
            break; //allow two level
    }
    // 3. 处理文件名特殊字符和分隔符
    let variableName = name
        .replace(/[^a-zA-Z0-9_]/g, '_') // 替换所有非字母数字字符为下划线
        .replace(/^_+/, '') // 移除开头的下划线
        .replace(/_+$/, '') // 移除结尾的下划线
        .replace(/_+/g, '_'); // 将多个连续下划线合并为一个
    // 4. 如果结果为空字符串，使用默认值
    if (!variableName) {
        variableName = '';
    }
    return selectedPart.reverse().join('.') + variableName + '.' + textToCamelCaseVariable(english);
}
/**
 * 修改文件名及路径的函数
 * @param oldPath - 原始文件路径（必须存在）
 * @param newPath - 新文件路径（可包含新目录和文件名）
 * @param options - 可选配置项
 * @returns Promise<void>
 */
async function renameFile(oldPath, newPath, options = {}) {
    const { overwrite = false, mode } = options;
    const newDir = path_1.default.dirname(newPath);
    try {
        // 1. 确保目标目录存在
        await ensureDirectoryExists(newDir, { mode });
        // 2. 检查目标文件是否存在
        let stats;
        try {
            stats = await promises_1.default.stat(newPath);
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw new Error(`检查目标文件时出错: ${error.message}`);
            }
        }
        // 3. 处理文件覆盖逻辑
        if (stats && stats.isFile()) {
            if (!overwrite) {
                throw new Error(`目标文件已存在: ${newPath}`);
            }
            // 删除已存在的文件
            await promises_1.default.unlink(newPath);
        }
        // 4. 执行重命名操作
        await promises_1.default.rename(oldPath, newPath);
    }
    catch (error) {
        // 统一错误处理
        throw new Error(`文件操作失败: ${error.message}`);
    }
}
/**
 * 确保目录存在的工具函数
 * @param dirPath - 目标目录路径
 * @param options - 配置项
 */
async function ensureDirectoryExists(dirPath, options = {}) {
    try {
        await promises_1.default.mkdir(dirPath, {
            recursive: true,
            mode: options.mode ?? (0o777 & ~process.umask())
        });
    }
    catch (error) {
        const err = error;
        if (err.code !== 'EEXIST') {
            throw new Error(`创建目录失败: ${err.code} - ${err.message}`);
        }
    }
}
//# sourceMappingURL=file-utils.js.map
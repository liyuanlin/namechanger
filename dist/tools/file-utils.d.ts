export declare function getFileExtension(filename: string): string;
/**
 * 遍历指定目录的全部文件，同时忽略指定的目录
 * @param dirPath 要遍历的目录路径
 * @param ignoreDirs 要忽略的目录列表
 * @returns 文件路径的数组
 */
export declare function getAllFiles(dirPath: string, exts: string[], ignoreDirs?: string[]): string[];
export declare function getFileContent(path: string): string;
export declare function writeFile(path: string, content: string): void;
export declare function englishToKeyword(filePath: string, english: string): string;
export interface RenameOptions {
    /** 是否覆盖已存在的目标文件（默认：false） */
    overwrite?: boolean;
    /** 创建目标目录时使用的权限模式（默认：0o777 & ~process.umask()） */
    mode?: number;
}
/**
 * 修改文件名及路径的函数
 * @param oldPath - 原始文件路径（必须存在）
 * @param newPath - 新文件路径（可包含新目录和文件名）
 * @param options - 可选配置项
 * @returns Promise<void>
 */
export declare function renameFile(oldPath: string, newPath: string, options?: RenameOptions): Promise<void>;
//# sourceMappingURL=file-utils.d.ts.map
import fs from 'fs';
import fsp from 'fs/promises';

import path from 'path';
export function getFileExtension(filename: string) {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex === -1) return ''; // Return empty string if no dot found
    return '.' + filename.substring(lastDotIndex + 1).toLocaleLowerCase();
}

/**
 * Traverse all files in specified directory while ignoring specified directories
 * @param dirPath Directory path to traverse
 * @param ignoreDirs List of directories to ignore
 * @returns Array of file paths
 */
export function getAllFiles(dirPath: string, exts: string[], ignoreDirs: string[] = ['node_modules']): string[] {
    let files: string[] = [];

    const readDirectory = (dir: string) => {
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                // Skip if directory is in ignore list
                if (ignoreDirs.includes(item.name)) {
                    continue;
                }
                // Recursively read subdirectories
                readDirectory(fullPath);
            } else if (item.isFile()) {
                // Collect file paths
                var ext = getFileExtension(item.name);
                if (exts.indexOf(ext) !== -1)
                    files.push(fullPath);
            }
        }
    };

    readDirectory(dirPath);
    return files;
}
export function getFileContent(path: string): string {
    return fs.readFileSync(path, 'utf8');
}

export function writeFile(path: string, content: string) {
    fs.writeFileSync(path, content, 'utf8');
}

function textToCamelCaseVariable(text: string): string {
    let fullText = text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '_') // Replace non-alphanumeric chars with underscore
        .replace(/^_+/, '')             // Remove leading underscores
        .replace(/_+$/, '')             // Remove trailing underscores
        .replace(/_+([a-z])/g, (_, c) => c.toUpperCase()) // Uppercase letter after underscore
        .replace(/^(\d)/, '_$1')        // Add underscore before leading digit
        || 'text'; // Ensure non-empty
    if(fullText.length>10){
        for (let i = 0;i<fullText.length ; i++) {
            if(fullText[i]=='_'){
                fullText=fullText.substring(0,i)+fullText.substring(i+1);
            }
        }
    }
    return fullText;
}
export function englishToKeyword(filePath: string, english: string): string {
    let removeWords = ['pages', 'views', 'components'];
    let replaceToWords = ['page', 'view', 'component']
    // 1. Get filename (without extension) and directory
    const { name, dir } = path.parse(filePath);
    let dirValues = dir.replaceAll('\\', '/').split('/');
    // 2. Find meaningful words from directory structure
    let selectedPart: string[] = [];
    for (let i = dirValues.length - 1; i >= 0; i--) {
        let found = false;
        var partValue = dirValues[i].toLowerCase()
        .replace(/[^a-zA-Z0-9_]/g, '_') // Replace all non-alphanumeric chars with underscore
        .replace(/^_+/, '')             // Remove leading underscores
        .replace(/_+$/, '')             // Remove trailing underscores
        .replace(/_+/g, '_');           // Merge consecutive underscores
        if (/^[0-9]/.test(partValue)) {
            continue;
        }
        if(partValue=='src'){// Stop at src directory (could extend for other root markers)
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
        if (selectedPart.length > 1) break;// Allow two levels
    }
    // 3. Process filename special characters and separators
    let variableName = name
        .replace(/[^a-zA-Z0-9_]/g, '_') // Replace all non-alphanumeric chars with underscore
        .replace(/^_+/, '')             // Remove leading underscores
        .replace(/_+$/, '')             // Remove trailing underscores
        .replace(/_+/g, '_');           // Merge consecutive underscores

    // 4. Use default if result is empty
    if (!variableName) {
        variableName = '';
    }
    return selectedPart.reverse().join('.') + variableName +'.' + textToCamelCaseVariable(english);
}


export interface RenameOptions {
  /** Whether to overwrite existing target file (default: false) */
  overwrite?: boolean;
  /** Permission mode when creating target directory (default: 0o777 & ~process.umask()) */
  mode?: number;
}


/**
 * Function to rename file and modify path
 * @param oldPath - Original file path (must exist)
 * @param newPath - New file path (can include new directory and filename)
 * @param options - Optional configuration
 * @returns Promise<void>
 */
export async function renameFile(
  oldPath: string,
  newPath: string,
  options: RenameOptions = {}
): Promise<void> {
  const { overwrite = false, mode } = options;
  const newDir = path.dirname(newPath);
 
  try {
    // 1. Ensure target directory exists
    await ensureDirectoryExists(newDir, { mode });

    // 2. Check if target file exists
    let stats: fs.Stats | undefined;
    try {
      stats = await fsp.stat(newPath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw new Error(`Error checking target file: ${(error as Error).message}`);
      }
    }

    // 3. Handle file overwrite logic
    if (stats && stats.isFile()) {
      if (!overwrite) {
        throw new Error(`Target file already exists: ${newPath}`);
      }
      // Delete existing file
      await fsp.unlink(newPath);
    }

    // 4. Execute rename operation
    await fsp.rename(oldPath, newPath);
  } catch (error) {
    // Unified error handling
    throw new Error(`File operation failed: ${(error as Error).message}`);
  }
}
 
/**
 * Utility function to ensure directory exists
 * @param dirPath - Target directory path
 * @param options - Configuration options
 */
async function ensureDirectoryExists(
  dirPath: string,
  options: { mode?: number } = {}
): Promise<void> {
  try {
    await fsp.mkdir(dirPath, {
      recursive: true,
      mode: options.mode ?? (0o777 & ~process.umask())
    });
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== 'EEXIST') {
      throw new Error(`Failed to create directory: ${err.code} - ${err.message}`);
    }
  }
}
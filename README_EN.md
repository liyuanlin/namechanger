# NameChanger

A CLI tool for batch file renaming and content replacement - supports both regular expressions and plain text replacement.

[中文 README](./README.md)

## Installation

### Global Installation

```bash
npm install -g @liyuanlin/namechanger
```

### Local Development

```bash
git clone https://github.com/liyuanlin/namechanger.git
cd namechanger
npm install
npm run build
npm link
```

## Development Commands

### Build Commands

```bash
# Build the project
npm run build

# Watch mode (auto-rebuild on changes)
npm run tscWatch
```

### Package Commands

```bash
# Package (generate .tgz file for local testing)
npm run pack

# Full package (clean + build + pack)
npm run pack:local
```

### Publish Commands

```bash
# Quick publish patch version (1.0.0 -> 1.0.1)
npm run publish:npm

# Quick publish minor version (1.0.0 -> 1.1.0)
npm run publish:minor

# Quick publish major version (1.0.0 -> 2.0.0)
npm run publish:major

# Full release workflow (clean + build + version bump + publish)
npm run release

# Publish public package (for scoped packages)
npm run publish:public

# Publish with current version (not recommended, only if version already manually updated)
npm run publish:current
```

### Clean Commands

```bash
# Linux/Mac
npm run clean

# Windows
npm run clean:win
```

## Usage

### Basic Usage

```bash
namechanger -c config.json
```

### View Help

```bash
namechanger --help
```

### View Version

```bash
namechanger --version
```

### Rename Only (Skip Content Replacement)

```bash
# Use command line option
namechanger -c config.json --rename-only

# Or set in configuration file
{
  "renameOnly": true,
  ...
}
```

### Remove Empty Directories

```bash
# Use command line option
namechanger -c config.json --remove-empty-dirs

# Or set in configuration file
{
  "removeEmptyDirs": true,
  ...
}
```

## Configuration

Create a JSON configuration file to define replacement rules:

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "root": "C:/projects/my-project",
  "files": [".sln", ".ps1", ".yml", ".md", ".css", ".scss", ".js", ".ts", ".html", ".cshtml"],
  "excludes": ["node_modules", ".git", ".vscode", "dist", ".idea", ".vs"],
  "replacements": [
    {
      "regex": false,
      "old": "src/",
      "new": "dist/"
    },
    {
      "regex": true,
      "old": "OldProjectName",
      "new": "NewProjectName"
    }
  ]
}
```

### Configuration Options

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Project name |
| `version` | string | No | Version number |
| `root` | string | **Yes** | Root directory path to process |
| `files` | string[] | **Yes** | List of file extensions to process (e.g.: `[".ts", ".js"]`). Use `""` for files without extension. |
| `excludes` | string[] | No | List of directory names to exclude |
| `renameOnly` | boolean | No | Only rename files, skip content replacement (default: false) |
| `removeEmptyDirs` | boolean | No | Remove empty directories after processing (default: false) |
| `replacements` | array | **Yes** | Array of replacement rules |

### Replacement Rules

Each replacement rule contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `regex` | boolean | Whether to use regular expression matching |
| `old` | string | Old text or regex pattern to find |
| `new` | string | New text to replace with |

## Features

- **File Renaming**: Batch rename files according to replacement rules
- **Content Replacement**: Find and replace text within file contents
- **Regex Support**: Support for complex matching using regular expressions
- **Path Handling**: Correctly handles both Windows and Unix path separators
- **Safe Exclusions**: Automatically excludes node_modules, .git, and other directories

## Examples

### Example 1: Simple Text Replacement

Replace all occurrences of `foo` with `bar` in the project:

```json
{
  "root": "./my-project",
  "files": [".txt", ".md"],
  "excludes": ["node_modules"],
  "replacements": [
    {
      "regex": false,
      "old": "foo",
      "new": "bar"
    }
  ]
}
```

### Example 2: Regular Expression Replacement

Replace all version numbers in `v1.x.x` format with `v2.x.x`:

```json
{
  "root": "./my-project",
  "files": [".json", ".md"],
  "replacements": [
    {
      "regex": true,
      "old": "v1\\.(\\d+)\\.(\\d+)",
      "new": "v2.$1.$2"
    }
  ]
}
```

### Example 3: Directory Path Replacement

Change source directory from `src/` to `lib/`:

```json
{
  "root": "./my-project",
  "files": [".ts", ".js", ".json"],
  "excludes": ["node_modules", "dist"],
  "replacements": [
    {
      "regex": false,
      "old": "src/",
      "new": "lib/"
    },
    {
      "regex": false,
      "old": "src\\",
      "new": "lib\\"
    }
  ]
}
```

## Important Notes

1. **Backup Data**: Please backup important files before operation, as replacement operations are irreversible
2. **Test Configuration**: It is recommended to test the configuration file on a small scale first
3. **Path Format**: Windows paths can use forward slashes `/` or double backslashes `\\`
4. **Regex Escaping**: When using regex, special characters need to be properly escaped

## Changelog

### 1.0.0
- Initial release
- Support for file renaming and content replacement
- Regular expression and plain text support
- CLI parameter support

## License

MIT

## Author

liyuanlin138@gmail.com

## Repository

- [GitHub](https://github.com/liyuanlin/namechanger)
- [Issues](https://github.com/liyuanlin/namechanger/issues)

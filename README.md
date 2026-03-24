# NameChanger

文件批量重命名和内容替换工具 - 支持正则表达式和普通文本替换。

[English README](./README_EN.md)

## 安装

### 全局安装

```bash
npm install -g namechanger
```

### 本地开发安装

```bash
git clone <仓库地址>
cd namechanger
npm install
npm run build
npm link
```

## 开发命令

### 打包命令

```bash
# 打包（生成 tgz 文件，用于本地测试）
npm run pack

# 完整打包（清理 + 构建 + 打包）
npm run pack:local
```

### 发布命令

```bash
# 发布到 npm（自动检查 registry）
npm run publish:npm

# 发布公开包（Scoped 包需要）
npm run publish:public

# 一键发布补丁版本（清理 + 构建 + 版本号 + 1 + 发布）
npm run release

# 发布次要版本（1.0.0 -> 1.1.0）
npm run release:minor

# 发布主要版本（1.0.0 -> 2.0.0）
npm run release:major
```

### 清理命令

```bash
# Linux/Mac
npm run clean

# Windows
npm run clean:win
```

## 使用方法

### 基本用法

```bash
namechanger -c config.json
```

### 查看帮助

```bash
namechanger --help
```

## 配置文件

创建一个 JSON 配置文件来定义替换规则：

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

### 配置项说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 否 | 项目名称 |
| `version` | string | 否 | 版本号 |
| `root` | string | **是** | 要处理的根目录路径 |
| `files` | string[] | **是** | 要处理的文件扩展名列表（例如：`[".ts", ".js"]`） |
| `excludes` | string[] | 否 | 要排除的目录名列表 |
| `replacements` | array | **是** | 替换规则数组 |

### 替换规则

每个替换规则包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `regex` | boolean | 是否使用正则表达式匹配 |
| `old` | string | 要查找的旧文本或正则表达式 |
| `new` | string | 替换后的新文本 |

## 功能特性

- **文件重命名**: 根据替换规则批量重命名文件
- **内容替换**: 在文件内容中查找并替换文本
- **正则支持**: 支持正则表达式进行复杂匹配
- **路径处理**: 正确处理 Windows 和 Unix 路径分隔符
- **安全排除**: 自动排除 node_modules、.git 等目录

## 示例

### 示例1: 简单文本替换

将项目中的所有 `foo` 替换为 `bar`：

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

### 示例2: 正则表达式替换

将所有 `v1.x.x` 格式的版本号替换为 `v2.x.x`：

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

### 示例3: 目录路径替换

将源代码目录从 `src/` 改为 `lib/`：

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

## 注意事项

1. **备份数据**: 操作前请备份重要文件，替换操作不可逆
2. **测试配置**: 建议先在小范围测试配置文件
3. **路径格式**: Windows 路径可以使用正斜杠 `/` 或双反斜杠 `\\`
4. **正则转义**: 使用正则时，特殊字符需要正确转义

## 许可证

ISC

## 作者

liyuanlin138@gmail.com

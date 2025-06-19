# WebP Conversion MCP Server

This project is a Model Context Protocol (MCP) server that converts image files to WebP format.

## Features

- Convert PNG, JPG, and JPEG files to WebP
- Support for single image or batch image conversion
- Option to configure quality and lossless compression
- Option to keep original files
- Provides a detailed report of the conversion result

### Installation & Execution

```bash
npx -y @xoy8n/webp-converter@latest
```

### Cursor mcp.json Configuration

```json
{
  "mcpServers": {
    "webp-converter": {
      "command": "npx",
      "args": ["-y", "@xoy8n/webp-converter@latest"]
    }
  }
}
```

## MCP Tool List

### 1. convert_to_webp

Converts a single image file to WebP format.

**Parameters:**

- `image_path`: Path to the image file to convert
- `base_path`: Base directory path
- `quality`: WebP quality setting (default: 95)
- `lossless`: Whether to use lossless compression (default: false)
- `keep_original`: Whether to retain the original file (default: false)

**Returns:**

- Conversion success status
- Input/output file paths
- File size before/after conversion
- Applied quality and compression settings

### 2. batch_convert_to_webp

Converts multiple image files to WebP format in one go.

**Parameters:**

- `image_paths`: Array of paths to image files to convert
- `base_path`: Base directory path (optional)
- `quality`: WebP quality setting (default: 95)
- `lossless`: Whether to use lossless compression (default: false)
- `keep_original`: Whether to retain the original files (default: false)

**Returns:**

- Array of conversion results for each image file

## How to Use

1. Select the image files you want to convert.
2. Run the `convert_to_webp` or `batch_convert_to_webp` command via the MCP tools.
3. Check the conversion results.

## License

MIT

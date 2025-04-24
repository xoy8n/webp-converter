#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { convertToWebP } from "./convert.js";
import * as path from "path";

// 서버 초기화
const server = new McpServer({
  name: "convert_webp",
  version: "1.0.3",
});

// 도구 정의
server.tool(
  "convert_to_webp",
  {
    image_path: z.string(),
    quality: z.number().default(80),
    lossless: z.boolean().default(false),
    keep_original: z.boolean().default(false),
    base_path: z.string(),
  },
  async (params) => {
    const imagePath = params.image_path.replace(/^"|"$/g, "");
    const basePath = params.base_path || process.cwd();

    const result = await convertToWebP(
      imagePath,
      params.quality,
      params.lossless,
      params.keep_original,
      basePath
    );
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "batch_convert_to_webp",
  {
    image_paths: z.array(z.string()),
    quality: z.number().default(80),
    lossless: z.boolean().default(false),
    keep_original: z.boolean().default(false),
    base_path: z.string().optional(),
  },
  async (params) => {
    const results = [];
    const basePath = params.base_path || process.cwd();

    for (const path of params.image_paths) {
      const imagePath = path.replace(/^"|"$/g, "");

      const result = await convertToWebP(
        imagePath,
        params.quality,
        params.lossless,
        params.keep_original,
        basePath
      );
      results.push(result);
    }
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  }
);

// 서버 시작
const transport = new StdioServerTransport();
server.connect(transport).catch((error) => {
  console.error("서버 연결 오류:", error);
  process.exit(1);
});

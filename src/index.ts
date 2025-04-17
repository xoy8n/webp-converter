#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import os from "os";

// 서버 초기화
const server = new McpServer({
  name: "WebP Converter",
  version: "1.0.0",
});

function expandHome(filepath: string): string {
  if (filepath.startsWith("~/") || filepath === "~") {
    return path.join(os.homedir(), filepath.slice(1));
  }
  return filepath;
}

function normalizePath(p: string): string {
  return path.normalize(p);
}

// 명령줄 인수에서 허용 디렉토리 받기
const inputDirs = process.argv.slice(2);
if (inputDirs.length === 0) {
  console.error(
    "사용법: convert-webp-mcp <허용-디렉토리> [추가-허용-디렉토리...]"
  );
  process.exit(1);
}

// 허용된 디렉토리를 정규화하여 저장
const allowedDirectories = inputDirs.map((dir) =>
  normalizePath(path.resolve(expandHome(dir)))
);

// 디렉토리 접근 가능 여부 확인
Promise.all(
  inputDirs.map(async (dir) => {
    try {
      const expandedDir = expandHome(dir);
      const stats = await fs.promises.stat(expandedDir);
      if (!stats.isDirectory()) {
        console.error(`오류: ${dir}는 디렉토리가 아닙니다.`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`디렉토리 ${dir} 접근 오류:`, error);
      process.exit(1);
    }
  })
);

// 경로 유효성 검사 함수
async function validatePath(requestedPath: string): Promise<string> {
  const expandedPath = expandHome(requestedPath);
  const absolute = path.isAbsolute(expandedPath)
    ? path.resolve(expandedPath)
    : path.resolve(process.cwd(), expandedPath);

  const normalizedRequested = normalizePath(absolute);

  const isAllowed = allowedDirectories.some((dir) =>
    normalizedRequested.startsWith(dir)
  );
  if (!isAllowed) {
    throw new Error(
      `접근 거부 - 허용된 디렉토리 외부 경로: ${absolute} (허용: ${allowedDirectories.join(", ")})`
    );
  }

  try {
    const realPath = await fs.promises.realpath(absolute);
    const isRealPathAllowed = allowedDirectories.some((dir) =>
      normalizePath(realPath).startsWith(dir)
    );
    if (!isRealPathAllowed) {
      throw new Error(
        "접근 거부 - 심볼릭 링크 대상이 허용된 디렉토리 외부에 있습니다"
      );
    }
    return realPath;
  } catch {
    const parent = path.dirname(absolute);
    try {
      const realParent = await fs.promises.realpath(parent);
      if (
        !allowedDirectories.some((dir) =>
          normalizePath(realParent).startsWith(dir)
        )
      ) {
        throw new Error(
          "접근 거부 - 부모 디렉토리가 허용된 디렉토리 외부에 있습니다"
        );
      }
      return absolute;
    } catch {
      throw new Error(`부모 디렉토리가 존재하지 않습니다: ${parent}`);
    }
  }
}

/**
 * 이미지 파일을 WebP 형식으로 변환합니다.
 */
async function convertToWebP(
  imagePath: string,
  quality: number = 80,
  lossless: boolean = false,
  keepOriginal: boolean = false
): Promise<any> {
  try {
    // 경로 유효성 검사
    const validatedPath = await validatePath(imagePath);

    // 입력 파일이 존재하는지 확인
    if (!fs.existsSync(validatedPath)) {
      throw new Error(`입력 파일이 존재하지 않습니다: ${validatedPath}`);
    }

    // 이미지 확장자 확인
    const ext = path.extname(validatedPath).toLowerCase();
    if (![".png", ".jpg", ".jpeg"].includes(ext)) {
      throw new Error(`지원되지 않는 이미지 형식입니다: ${ext}`);
    }

    // 출력 파일명 생성
    const filename = path.basename(validatedPath, ext);
    const outputPath = path.join(
      path.dirname(validatedPath),
      `${filename}.webp`
    );

    // 출력 경로 유효성 검사
    await validatePath(outputPath);

    // 변환 옵션 설정
    const options = { quality, lossless };

    // 이미지 변환
    await sharp(validatedPath).webp(options).toFile(outputPath);

    // 원본 파일 삭제 여부 확인
    if (!keepOriginal) {
      fs.unlinkSync(validatedPath);
    }

    // 결과 반환
    return {
      success: true,
      input_path: validatedPath,
      output_path: outputPath,
      size_before: fs.statSync(keepOriginal ? validatedPath : outputPath).size,
      size_after: fs.statSync(outputPath).size,
      quality,
      lossless,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      input_path: imagePath,
    };
  }
}

// 도구 정의
server.tool(
  "convert_to_webp",
  {
    image_path: z.string(),
    quality: z.number().default(80),
    lossless: z.boolean().default(false),
    keep_original: z.boolean().default(false),
  },
  async (params) => {
    const result = await convertToWebP(
      params.image_path,
      params.quality,
      params.lossless,
      params.keep_original
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
  },
  async (params) => {
    const results = [];
    for (const imagePath of params.image_paths) {
      const result = await convertToWebP(
        imagePath,
        params.quality,
        params.lossless,
        params.keep_original
      );
      results.push(result);
    }
    return {
      content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
    };
  }
);

// 허용된 디렉토리 목록 툴 추가
server.tool(
  "list_allowed_directories",
  {
    random_string: z.string(),
  },
  async () => {
    return {
      content: [
        {
          type: "text",
          text: `허용된 디렉토리 목록:\n${allowedDirectories.join("\n")}`,
        },
      ],
    };
  }
);

// 서버 시작
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("WebP 변환 MCP 서버가 stdio에서 실행 중입니다");
  console.error("허용된 디렉토리:", allowedDirectories);
}

runServer().catch((error) => {
  console.error("서버 실행 중 치명적 오류 발생:", error);
  process.exit(1);
});

# WebP 변환 MCP 서버

이 프로젝트는 이미지 파일을 WebP 형식으로 변환하는 Model Context Protocol(MCP) 서버입니다.

## 기능

- PNG, JPG, JPEG 파일을 WebP로 변환
- 단일 이미지 또는 여러 이미지 일괄 변환 지원
- 품질 및 무손실 압축 옵션 설정 가능
- 원본 파일 유지 옵션
- 변환 결과 상세 리포트 제공

### 설치 및 실행

```bash
npx -y @xoy8n/webp-converter@latest
```

### Cursor의 mcp.json 설정

```json
{
  "mcpServers": {
    "mcp-test": {
      "command": "npx",
      "args": ["-y", "@xoy8n/webp-converter"]
    }
  }
}
```

## MCP 도구 목록

### 1. convert_to_webp

단일 이미지 파일을 WebP로 변환합니다.

**매개변수:**

- `image_path`: 변환할 이미지 파일 경로
- `base_path`: 기준 디렉토리 경로
- `quality`: WebP 품질 설정 (기본값: 80)
- `lossless`: 무손실 압축 여부 (기본값: false)
- `keep_original`: 원본 파일 유지 여부 (기본값: false)

**반환값:**

- 변환 성공 여부
- 입력/출력 파일 경로
- 변환 전/후 파일 크기
- 적용된 품질 및 압축 설정

### 2. batch_convert_to_webp

여러 이미지 파일을 한 번에 WebP로 변환합니다.

**매개변수:**

- `image_paths`: 변환할 이미지 파일 경로 배열
- `base_path`: 기준 디렉토리 경로 (선택사항)
- `quality`: WebP 품질 설정 (기본값: 80)
- `lossless`: 무손실 압축 여부 (기본값: false)
- `keep_original`: 원본 파일 유지 여부 (기본값: false)

**반환값:**

- 각 이미지 파일에 대한 변환 결과 배열

## 사용 방법

1. 변환하려는 이미지 파일 선택
2. MCP 도구를 통해 `convert_to_webp` 또는 `batch_convert_to_webp` 명령어 실행
3. 변환 결과 확인

## 라이센스

MIT

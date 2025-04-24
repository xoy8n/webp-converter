import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";

/**
 * 이미지 파일을 WebP 형식으로 변환합니다.
 */
export async function convertToWebP(
  imagePath: string,
  quality: number = 80,
  lossless: boolean = false,
  keepOriginal: boolean = false,
  basePath: string = process.cwd()
): Promise<any> {
  try {
    // 상대 경로를 절대 경로로 변환
    const absolutePath = path.resolve(basePath, imagePath);

    // 입력 파일이 존재하는지 확인
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`입력 파일이 존재하지 않습니다: ${absolutePath}`);
    }

    // 이미지 확장자 확인
    const ext = path.extname(absolutePath).toLowerCase();
    if (![".png", ".jpg", ".jpeg"].includes(ext)) {
      throw new Error(`지원되지 않는 이미지 형식입니다: ${ext}`);
    }

    // 출력 파일명 생성
    const filename = path.basename(absolutePath, ext);
    const outputPath = path.join(
      path.dirname(absolutePath),
      `${filename}.webp`
    );

    // 변환 옵션 설정
    const options = { quality, lossless };

    // 이미지 변환
    await sharp(absolutePath).webp(options).toFile(outputPath);

    // 원본 파일 삭제 여부 확인
    if (!keepOriginal) {
      fs.unlinkSync(absolutePath);
    }

    // 결과 반환
    return {
      success: true,
      input_path: absolutePath,
      output_path: outputPath,
      size_before: fs.statSync(keepOriginal ? absolutePath : outputPath).size,
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

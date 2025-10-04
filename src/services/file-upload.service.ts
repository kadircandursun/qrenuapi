import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * File upload service for handling file operations
 */
@Injectable()
export class FileUploadService {
  private readonly uploadsDir = path.join(process.cwd(), 'uploads');
  private readonly logosDir = path.join(this.uploadsDir, 'logos');
  private readonly categoriesDir = path.join(this.uploadsDir, 'categories');
  private readonly productsDir = path.join(this.uploadsDir, 'products');

  constructor() {
    this.ensureDirectoriesExist();
  }

  /**
   * Ensure upload directories exist
   */
  private ensureDirectoriesExist(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
    if (!fs.existsSync(this.logosDir)) {
      fs.mkdirSync(this.logosDir, { recursive: true });
    }
    if (!fs.existsSync(this.categoriesDir)) {
      fs.mkdirSync(this.categoriesDir, { recursive: true });
    }
    if (!fs.existsSync(this.productsDir)) {
      fs.mkdirSync(this.productsDir, { recursive: true });
    }
  }

  /**
   * Save base64 image to logos directory
   * @param base64Data Base64 encoded image data
   * @param fileName Optional custom filename
   * @returns Relative file path
   */
  async saveBase64Image(base64Data: string, fileName?: string): Promise<string> {
    return this.saveBase64ImageToDirectory(base64Data, this.logosDir, 'uploads/logos', fileName);
  }

  /**
   * Save base64 image to categories directory
   * @param base64Data Base64 encoded image data
   * @param fileName Optional custom filename
   * @returns Relative file path
   */
  async saveCategoryImage(base64Data: string, fileName?: string): Promise<string> {
    return this.saveBase64ImageToDirectory(base64Data, this.categoriesDir, 'uploads/categories', fileName);
  }

  /**
   * Save base64 image to products directory
   * @param base64Data Base64 encoded image data
   * @param fileName Optional custom filename
   * @returns Relative file path
   */
  async saveProductImage(base64Data: string, fileName?: string): Promise<string> {
    return this.saveBase64ImageToDirectory(base64Data, this.productsDir, 'uploads/products', fileName);
  }

  /**
   * Save base64 image to specific directory with descriptive naming
   * @param base64Data Base64 encoded image data
   * @param targetDir Target directory
   * @param relativePathPrefix Relative path prefix
   * @param fileName Optional custom filename
   * @returns Relative file path
   */
  private async saveBase64ImageToDirectory(
    base64Data: string,
    targetDir: string,
    relativePathPrefix: string,
    fileName?: string
  ): Promise<string> {
    try {
      let mimeType: string;
      let base64String: string;

      // Check if it's a data URL format
      const dataUrlMatches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (dataUrlMatches && dataUrlMatches.length === 3) {
        // Data URL format: data:image/type;base64,data
        mimeType = dataUrlMatches[1];
        base64String = dataUrlMatches[2];
      } else {
        // Pure base64 string - assume PNG format
        mimeType = 'image/png';
        base64String = base64Data;
      }

      // Validate image type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(mimeType)) {
        throw new BadRequestException('Desteklenmeyen resim formatı. Sadece JPEG, PNG, GIF ve WebP desteklenir.');
      }

      // Get file extension from mime type
      const extension = this.getExtensionFromMimeType(mimeType);

      // Generate filename if not provided
      if (!fileName) {
        // Generate unique filename with timestamp and UUID
        const timestamp = Date.now();
        const uuid = uuidv4().substring(0, 8); // Short UUID for readability
        fileName = `${timestamp}-${uuid}.${extension}`;
      } else {
        // Ensure filename has correct extension
        const nameWithoutExt = path.parse(fileName).name;
        fileName = `${nameWithoutExt}.${extension}`;
      }

      // Create full file path
      const filePath = path.join(targetDir, fileName);

      // Convert base64 to buffer
      const buffer = Buffer.from(base64String, 'base64');

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (buffer.length > maxSize) {
        throw new BadRequestException('Resim boyutu çok büyük. Maksimum 5MB olmalıdır.');
      }

      // Write file
      fs.writeFileSync(filePath, buffer);

      // Return relative path
      return `${relativePathPrefix}/${fileName}`;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Resim kaydedilemedi');
    }
  }

  /**
   * Delete file
   * @param filePath Relative file path
   */
  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch (error) {
      console.warn('Dosya silinemedi:', error.message);
    }
  }

  /**
   * Get file extension from mime type
   * @param mimeType MIME type
   * @returns File extension
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
    };
    return mimeToExt[mimeType] || 'jpg';
  }

  /**
   * Check if file exists
   * @param filePath Relative file path
   * @returns True if file exists
   */
  fileExists(filePath: string): boolean {
    const fullPath = path.join(process.cwd(), filePath);
    return fs.existsSync(fullPath);
  }

  /**
   * Get file size
   * @param filePath Relative file path
   * @returns File size in bytes
   */
  getFileSize(filePath: string): number {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      return fs.statSync(fullPath).size;
    }
    return 0;
  }
}

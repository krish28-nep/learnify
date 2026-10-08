import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { access, mkdir, unlink, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

@Injectable()
export class FileStorageService {
  private readonly directory = resolve(process.cwd(), 'uploads', 'pdfs');

  async save(buffer: Buffer): Promise<string> {
    await mkdir(this.directory, { recursive: true });
    const key = `${randomUUID()}.pdf`;
    await writeFile(resolve(this.directory, key), buffer, { flag: 'wx' });
    return key;
  }

  async getPath(key: string): Promise<string> {
    if (!/^[0-9a-f-]{36}\.pdf$/i.test(key)) {
      throw new NotFoundException('PDF not found');
    }

    const path = resolve(this.directory, key);
    try {
      await access(path);
    } catch {
      throw new NotFoundException('PDF not found');
    }
    return path;
  }

  async remove(key: string): Promise<void> {
    if (!/^[0-9a-f-]{36}\.pdf$/i.test(key)) {
      return;
    }

    try {
      await unlink(resolve(this.directory, key));
    } catch (error) {
      if (hasErrorCode(error, 'ENOENT')) {
        return;
      }
      throw error;
    }
  }
}

function hasErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === code
  );
}

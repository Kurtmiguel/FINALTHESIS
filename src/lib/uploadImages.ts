import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

export async function uploadImages(files: File[]): Promise<string[]> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');

  // Create the uploads directory if it doesn't exist
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      console.error('Error creating uploads directory:', error);
      throw error;
    }
  }

  const uploadPromises = files.map(async (file) => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = uuidv4() + path.extname(file.name);
    const filepath = path.join(uploadDir, filename);

    try {
      await writeFile(filepath, buffer);
      return `/uploads/${filename}`;
    } catch (error) {
      console.error('Error writing file:', error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}

export async function deleteImage(imageUrl: string): Promise<void> {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const filename = path.basename(imageUrl);
  const filepath = path.join(uploadDir, filename);

  try {
    await unlink(filepath);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
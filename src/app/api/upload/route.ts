import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { r2 } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { createId } from '@paralleldrive/cuid2';
import sharp from 'sharp';

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 80;

async function compressImage(buffer: Buffer, mimeType: string): Promise<{ data: Buffer; contentType: string }> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  const needsResize = (metadata.width && metadata.width > MAX_WIDTH) || 
                      (metadata.height && metadata.height > MAX_HEIGHT);

  let pipeline = image;
  
  if (needsResize) {
    pipeline = pipeline.resize(MAX_WIDTH, MAX_HEIGHT, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  if (mimeType === 'image/png') {
    return {
      data: await pipeline.png({ quality: QUALITY, compressionLevel: 9 }).toBuffer(),
      contentType: 'image/png',
    };
  } else if (mimeType === 'image/webp') {
    return {
      data: await pipeline.webp({ quality: QUALITY }).toBuffer(),
      contentType: 'image/webp',
    };
  } else {
    return {
      data: await pipeline.webp({ quality: QUALITY }).toBuffer(),
      contentType: 'image/webp',
    };
  }
}

export const POST = auth(async function POST(req) {
  try {
    if (!req.auth?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isImage = file.type.startsWith('image/');
    let finalBuffer: Buffer;
    let contentType: string;
    let ext: string;

    if (isImage) {
      const compressed = await compressImage(buffer, file.type);
      finalBuffer = compressed.data;
      contentType = compressed.contentType;
      ext = contentType === 'image/png' ? 'png' : 'webp';
    } else {
      finalBuffer = buffer;
      contentType = file.type;
      ext = file.name.split('.').pop() || 'bin';
    }

    const key = `traces/${createId()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
      Body: finalBuffer,
    });

    await r2.send(command);

    const fileUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ fileUrl });
  } catch (error) {
    console.error('POST /api/upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

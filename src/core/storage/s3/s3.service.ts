import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Service {
  private readonly s3: S3Client;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.awsRegion,
      credentials: {
        accessKeyId: this.awsAccessID,
        secretAccessKey: this.awsSecretAccessKey,
      },
    });
  }

  get awsRegion(): string {
    return this.configService.get<string>('AWS_REGION') || '';
  }

  get awsAccessID(): string {
    return this.configService.get<string>('AWS_ACCESS_KEY_ID') || '';
  }

  get awsSecretAccessKey(): string {
    return this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '';
  }

  get awsBucketName(): string {
    return this.configService.get<string>('AWS_S3_BUCKET_NAME') || '';
  }

  async uploadFile(file: Express.Multer.File, folder = 'uploads') {
    try {
      const ext = extname(file.originalname);
      const baseName = file.originalname
        .replace(ext, '')
        .replace(/\s+/g, '_')
        // eslint-disable-next-line no-useless-escape
        .replace(/[^\w\-]/g, '')
        .toLowerCase();
      const key = `${folder}/${uuid()}-${baseName}`;

      const command = new PutObjectCommand({
        Bucket: this.awsBucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3.send(command);

      return `https://${this.awsBucketName}.s3.${this.awsRegion}.amazonaws.com/${key}${ext}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload file to S3');
    }
  }
}

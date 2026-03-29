import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';

@Injectable()
export class S3Service {
    private readonly bucket: string;
    private readonly region: string;
    private readonly s3: S3Client;

    constructor(private readonly configService: ConfigService) {
        this.bucket = this.configService.get('AWS_BUCKET_NAME')!;
        this.region = this.configService.get('AWS_REGION')!;
        this.s3 = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY')!,
                secretAccessKey: this.configService.get('AWS_SECRET_KEY')!,
            },
        });
    }

    async upload(file: Express.Multer.File) {
        const key = `uploads/${Date.now()}${extname(file.originalname)}`;
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            });
            await this.s3.send(command);
            const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
            return url;
        } catch (error) {
            console.log('s3 uploaderror', error);
            throw new InternalServerErrorException('S3 upload failed');
        }
    }

    async delete(key: string) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            await this.s3.send(command);
        } catch (error) {
            console.error('S3 Delete Error:', error);

            throw new InternalServerErrorException('S3 delete failed');
        }
    }
}

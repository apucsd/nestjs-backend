import { Injectable } from '@nestjs/common';
import { S3Service } from './s3/s3.service';

@Injectable()
export class UploadsService {
    constructor(private s3Service: S3Service) {}

    async uploadSingle(file: Express.Multer.File) {
        const result = await this.s3Service.upload(file);
        return result;
    }
    async uploadMany(files: Express.Multer.File[]) {
        return Promise.all(files.map((file) => this.s3Service.upload(file)));
    }

    async deleteOne(key: string) {
        return await this.s3Service.delete(key);
    }
}

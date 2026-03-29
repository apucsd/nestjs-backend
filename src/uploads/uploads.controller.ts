import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    Delete,
    Param,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { multerOptions } from './config/multer.config';
@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) {}

    @Post()
    @UseInterceptors(FilesInterceptor('files', 5, multerOptions))
    async uploadMultiple(@UploadedFiles() files: Express.Multer.File[]) {
        const result = await this.uploadsService.uploadMany(files);
        return {
            message: 'Files uploaded successfully',
            data: result,
        };
    }
    @Post('/single')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        const result = await this.uploadsService.uploadSingle(file);
        return {
            message: 'File uploaded successfully',
            data: result,
        };
    }

    @Delete(':filename')
    async deleteOne(@Param('filename') filename: string) {
        const result = await this.uploadsService.deleteOne(filename);
        return {
            message: 'File deleted successfully',
            data: result,
        };
    }
}

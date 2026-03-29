import { diskStorage, memoryStorage } from 'multer';
// import { extname, join } from 'path';
// import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';

export const multerOptions = {
    // NOTE: diskStorage need only for server upload
    // storage: diskStorage({
    //     destination: (_req, _file, callback) => {
    //         const uploadPath = join(process.cwd(), 'uploads');

    //         if (!fs.existsSync(uploadPath)) {
    //             fs.mkdirSync(uploadPath, { recursive: true });
    //         }

    //         callback(null, uploadPath);
    //     },
    //     filename: (_req, file, callback) => {
    //         const uniqueName =
    //             Date.now() + '-' + Math.round(Math.random() * 1e9);

    //         callback(null, uniqueName + extname(file.originalname));
    //     },
    // }),
    storage: memoryStorage(),

    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },

    fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
            'video/mp4',
            'video/x-matroska',
            'video/x-msvideo',
            'audio/mp3',
            'audio/mpeg',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(
                new BadRequestException('Unsupported file type'),
                false,
            );
        }

        callback(null, true);
    },
};

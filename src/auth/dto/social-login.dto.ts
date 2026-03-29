import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SocialUserDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    provider: string;

    @IsString()
    @IsNotEmpty()
    providerId: string;

    @IsString()
    @IsOptional()
    image?: string;
}

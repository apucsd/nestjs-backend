import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    MinLength,
} from 'class-validator';
import { UserRole } from 'generated/prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ description: 'The email of the user' })
    @IsEmail({}, { message: 'Please enter a valid email' })
    email: string;
    @ApiProperty({ description: 'The password of the user' })
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    password: string;
    @ApiProperty({ description: 'The name of the user' })
    @IsNotEmpty({ message: 'Name is required' })
    name: string;
    @ApiProperty({
        enum: UserRole,
        default: UserRole.USER,
        description: 'The role of the user',
    })
    @IsOptional()
    @IsEnum(UserRole, { message: 'Role must be a valid role' })
    role: UserRole = UserRole.USER;
}

import {
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Name cannot be empty' })
    @MinLength(3, { message: 'Name must be at least 3 characters' })
    @MaxLength(50, { message: 'Name must be at most 50 characters' })
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Image cannot be empty' })
    @IsUrl({}, { message: 'Please provide a valid URL' })
    image?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Phone cannot be empty' })
    @MinLength(11, { message: 'Phone must be at least 11 characters' })
    @MaxLength(11, { message: 'Phone must be at most 11 characters' })
    phone?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Address cannot be empty' })
    address?: string;
}

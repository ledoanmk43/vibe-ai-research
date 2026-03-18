import { IsString, MaxLength, IsOptional, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

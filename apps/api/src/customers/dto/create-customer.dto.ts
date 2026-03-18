import {
  IsString,
  MaxLength,
  IsOptional,
  IsEmail,
  IsUUID,
} from 'class-validator';

export class CreateCustomerDto {
  @IsUUID()
  storeId: string;

  @IsString()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

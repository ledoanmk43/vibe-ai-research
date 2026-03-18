import {
  IsString,
  MaxLength,
  IsOptional,
  IsNumber,
  IsPositive,
  IsEnum,
  IsUUID,
  IsBoolean,
} from 'class-validator';
import { UnitType } from '../../common/enums/unit-type.enum';

export class CreateServiceDto {
  @IsUUID()
  storeId: string;

  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  pricePerUnit: number;

  @IsEnum(UnitType)
  unitType: UnitType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

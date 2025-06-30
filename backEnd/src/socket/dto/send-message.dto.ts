import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export class SendMessageDto {

    @IsNotEmpty()
    @IsNumber()
    @Type(() => Number)
    sessionId: number;

    @IsNotEmpty()
    @IsString()
    type: 'text' | 'image';

    @ValidateIf(object => object.type === 'text')
    @IsNotEmpty()
    @IsString()
    content: string;
}
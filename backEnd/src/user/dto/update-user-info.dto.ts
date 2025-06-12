import { IsString, IsOptional } from 'class-validator';

export class UpdateUserInfoDto {

    @IsString()
    @IsOptional()
    nickname?: string;

    @IsString()
    @IsOptional()
    avatar?: string;

    @IsString()
    @IsOptional()
    phoneNumber?: string;

}
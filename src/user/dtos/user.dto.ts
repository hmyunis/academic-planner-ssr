import { IsEmail, IsNumber, IsString, MaxLength, MinLength } from "class-validator";

export class User{
    @IsString()
    id: string;

    @IsString()
    @MaxLength(30)
    username: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    institution: string;

    @IsNumber()
    @MaxLength(4)
    yearOfStudy: number;
}
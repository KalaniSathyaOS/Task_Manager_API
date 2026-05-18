import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  type?: string | null;
}

export class UpdateProjectDto {
  @IsOptional()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  type?: string | null;
}

export class ProjectListDto {
  id: string;
  name: string;
  description?: string | null;
  type?: string | null;
  taskCount: number;
  createdAt: string;
}

export class ProjectListRequest {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortDir?: 'asc' | 'desc';
}

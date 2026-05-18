import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/jwt.guard';
import { CreateProjectDto, UpdateProjectDto, ProjectListRequest } from './dto/project.dto';
import { ProjectsService } from './projects.service';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth('access-token')
@UseGuards(JwtGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateProjectDto) {
    return this.projectsService.create(req.user.userId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req, @Query() query: ProjectListRequest) {
    return this.projectsService.findAll(query, req.user.userId);
  }

  // @Delete(':id')
  // delete(@Param('id') id: string, @Req() req) {
  //   return this.projectsService.delete(id, req.user.userId);
  // }
}

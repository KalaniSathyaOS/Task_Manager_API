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
import { CreateTaskDto, UpdateTaskDto, TaskListRequest } from './dto/task.dto';
import { TasksService } from './tasks.service';

@UseGuards(JwtGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(req.user.userId, dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(id, req.user.userId, dto);
  }

  @Get()
  getByProject(@Req() req, @Query() query: TaskListRequest) {
    return this.tasksService.getByProject(req.user.userId, query);
  }

  // @Delete(':id')
  // delete(@Param('id') id: string, @Req() req) {
  //   return this.tasksService.delete(id, req.user.userId);
  // }
}

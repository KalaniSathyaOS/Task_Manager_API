import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto, TaskListRequest } from './dto/task.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  // CREATE TASK
  async create(userId: string, dto: CreateTaskDto) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: dto.projectId,
        userId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const existingTask = await this.prisma.task.findFirst({
      where: {
        title: dto.title,
        projectId: dto.projectId,
      },
    });

    if (existingTask) {
      throw new BadRequestException('Task title already exists');
    }

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        dueDate: dto.dueDate,
        projectId: dto.projectId,
      },
    });
  }

  // UPDATE TASK
  async update(taskId: string, userId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          userId,
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    // CHECK DUPLICATES
    if (dto.title && dto.title !== task.title) {
      const duplicateTask = await this.prisma.task.findFirst({
        where: {
          title: dto.title,
          projectId: task.projectId,
          NOT: {
            id: taskId,
          },
        },
      });

      if (duplicateTask) {
        throw new BadRequestException('Task title already exists');
      }
    }

    // UPDATE ONLY CHANGED DATA
    const data: Prisma.TaskUpdateInput = {};

    if (dto.title !== undefined && dto.title !== task.title) {
      data.title = dto.title;
    }

    if (dto.description !== undefined && dto.description !== task.description) {
      data.description = dto.description;
    }

    if (dto.status !== undefined && dto.status !== task.status) {
      data.status = dto.status;
    }

    if (dto.priority !== undefined && dto.priority !== task.priority) {
      data.priority = dto.priority;
    }

    if (
      dto.dueDate !== undefined &&
      new Date(dto.dueDate).getTime() !== task.dueDate?.getTime()
    ) {
      data.dueDate = new Date(dto.dueDate);
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No updates detected');
    }

    return this.prisma.task.update({
      where: {
        id: taskId,
      },
      data,
    });
  }

  //  GET PROJECTS BY USER
  async getByProject(userId: string, request: TaskListRequest) {
    if (!request.projectId) {
      throw new BadRequestException('projectId is required to fetch tasks');
    }

    const sortBy = request.sortBy ?? 'createdAt';
    const sortDir = request.sortDir ?? 'desc';

    const page = Number(request.page ?? 1);
    const pageSize = Number(request.pageSize ?? 10);

    // PAGINATION
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // SORT BY CREATEDAT, TITLE, STATUS, PRIORITY, DUE DATE
    const orderByMap: Record<string, any> = {
      createdAt: { createdAt: sortDir },
      title: { title: sortDir },
      status: { status: sortDir },
      priority: { priority: sortDir },
      dueDate: { dueDate: sortDir },
    };

    const orderBy = orderByMap[sortBy] ?? { createdAt: 'desc' };

    // FILETR BY STATUS, PRIORITY & SEARCH BY TITLE, DESCRIPTION
    const where: any = {
      projectId: request.projectId,
      ...(request.status && { status: request.status }),
      ...(request.priority && { priority: request.priority }),
      ...(request.search && {
        OR: [
          {
            title: {
              contains: request.search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: request.search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const tasks = await this.prisma.task.findMany({
      where,
      orderBy,
      skip,
      take,
    });

    return tasks;
  }

  // async delete(id: string, userId: string) {
  //   const task = await this.prisma.task.findFirst({
  //     where: {
  //       id,
  //       project: { userId },
  //     },
  //   });

  //   if (!task) {
  //     throw new NotFoundException('Task not found');
  //   }

  //   return this.prisma.task.delete({
  //     where: { id },
  //   });
  // }
}

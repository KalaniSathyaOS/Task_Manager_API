import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  ProjectListDto,
  ProjectListRequest,
} from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // CREATE PROJECT
  async create(userId: string, dto: CreateProjectDto) {
    const existingProject = await this.prisma.project.findFirst({
      where: {
        name: dto.name,
        userId,
      },
    });

    if (existingProject) {
      throw new BadRequestException('Project name already exists');
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        type: dto.type,
        userId,
      },
    });
  }

  // UPDATE PROJECT
  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // CHECK DUPLICATES
    if (dto.name && dto.name !== project.name) {
      const duplicate = await this.prisma.project.findFirst({
        where: {
          name: dto.name,
          userId,
          NOT: {
            id: projectId,
          },
        },
      });

      if (duplicate) {
        throw new BadRequestException('Project name already exists');
      }
    }

    // UPDATE ONLY CHANGED DATA
    const data: any = {};

    if (dto.name !== undefined && dto.name !== project.name) {
      data.name = dto.name;
    }

    if (
      dto.description !== undefined &&
      dto.description !== project.description
    ) {
      data.description = dto.description;
    }

    if (dto.type !== undefined && dto.type !== project.type) {
      data.type = dto.type;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No updates detected');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data,
    });
  }

  //  GET PROJECTS BY USER
  async findAll(
    request: ProjectListRequest,
    userId: string,
  ): Promise<ProjectListDto[]> {
    if (userId === null) {
      throw new BadRequestException(
        'Can not find your projects, Please re login and try again.',
      );
    }

    const sortBy = request.sortBy ?? 'createdAt';
    const sortDir = request.sortDir ?? 'desc';

    // SORT BY NAME, CRAETEDAT, TASK COUNT
    const orderByMap: Record<string, any> = {
      name: { name: sortDir },
      createdAt: { createdAt: sortDir },
      taskCount: { tasks: { _count: sortDir } },
    };

    const orderBy = orderByMap[sortBy] ?? { createdAt: 'desc' };

    const page = Number(request.page ?? 1);
    const pageSize = Number(request.pageSize ?? 10);

    // PAGINATION
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // FILTER BY NAME, DESCRIPTION, TYPE
    const projects = await this.prisma.project.findMany({
      where: {
        userId,
        ...(request.search && {
          OR: [
            {
              name: {
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
            {
              type: {
                contains: request.search,
                mode: 'insensitive',
              },
            },
          ],
        }),
      },
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy,
      skip,
      take,
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      type: project.type,
      taskCount: project._count.tasks,
      createdAt: project.createdAt.toISOString(),
    }));
  }

  // async delete(id: string, userId: string) {
  //   const project = await this.prisma.project.findFirst({
  //     where: {
  //       id,
  //       userId,
  //     },
  //   });

  //   if (!project) {
  //     throw new NotFoundException('Project not found');
  //   }

  //   return this.prisma.project.delete({
  //     where: { id },
  //   });
  // }
}

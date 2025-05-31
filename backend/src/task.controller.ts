import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AITaskService } from '../services/ai-task.service';
import { Task } from '../entities/task.entity';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly aiTaskService: AITaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully', type: Task })
  async createTask(@Body() taskData: Partial<Task>): Promise<Task> {
    return this.aiTaskService.createTask(taskData);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiResponse({ status: 200, description: 'Task found', type: Task })
  async getTask(@Param('id') id: string): Promise<Task> {
    return this.aiTaskService.processTask(id);
  }
}

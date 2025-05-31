import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workflow } from '../entities/workflow.entity';
import { WorkflowNode } from '../entities/workflow-node.entity';
import { WorkflowConnection } from '../entities/workflow-connection.entity';
import { WorkflowExecution } from '../entities/workflow-execution.entity';
import { WorkflowExecutionStatus } from '../enums/workflow-execution-status.enum';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    @InjectRepository(Workflow)
    private readonly workflowRepository: Repository<Workflow>,
    @InjectRepository(WorkflowNode)
    private readonly nodeRepository: Repository<WorkflowNode>,
    @InjectRepository(WorkflowConnection)
    private readonly connectionRepository: Repository<WorkflowConnection>,
    @InjectRepository(WorkflowExecution)
    private readonly executionRepository: Repository<WorkflowExecution>,
  ) {}

  async executeWorkflow(workflowId: string, input: Record<string, unknown>): Promise<WorkflowExecution> {
    const workflow = await this.workflowRepository.findOne({
      where: { id: workflowId },
      relations: ['nodes', 'connections'],
    });

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const execution = await this.executionRepository.save({
      workflow,
      status: WorkflowExecutionStatus.PENDING,
      input,
      startedAt: new Date(),
    });

    try {
      const result = await this.executeWorkflowNodes(workflow, input);
      execution.status = WorkflowExecutionStatus.COMPLETED;
      execution.output = result;
      execution.completedAt = new Date();
    } catch (error) {
      execution.status = WorkflowExecutionStatus.FAILED;
      execution.error = error.message;
      execution.completedAt = new Date();
      throw error;
    }

    return this.executionRepository.save(execution);
  }

  private async executeWorkflowNodes(
    workflow: Workflow,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const nodeResults = new Map<string, unknown>();
    const executionOrder = this.calculateExecutionOrder(workflow);

    for (const nodeId of executionOrder) {
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (!node) continue;

      const nodeInput = this.prepareNodeInput(node, workflow.connections, nodeResults);
      const result = await this.executeNode(node, nodeInput);
      nodeResults.set(nodeId, result);
    }

    return Object.fromEntries(nodeResults);
  }

  private calculateExecutionOrder(workflow: Workflow): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const connections = workflow.connections.filter(conn => conn.sourceNodeId === nodeId);
      for (const conn of connections) {
        visit(conn.targetNodeId);
      }

      order.unshift(nodeId);
    };

    for (const node of workflow.nodes) {
      visit(node.id);
    }

    return order;
  }

  private prepareNodeInput(
    node: WorkflowNode,
    connections: WorkflowConnection[],
    nodeResults: Map<string, unknown>,
  ): Record<string, unknown> {
    const input: Record<string, unknown> = {};
    const incomingConnections = connections.filter(conn => conn.targetNodeId === node.id);

    for (const conn of incomingConnections) {
      const sourceResult = nodeResults.get(conn.sourceNodeId);
      if (sourceResult !== undefined) {
        input[conn.sourceOutputKey || 'output'] = sourceResult;
      }
    }

    return input;
  }

  private async executeNode(
    node: WorkflowNode,
    input: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    // Implement node execution logic based on node type
    return {
      ...input,
      processed: true,
      timestamp: new Date().toISOString(),
    };
  }
}

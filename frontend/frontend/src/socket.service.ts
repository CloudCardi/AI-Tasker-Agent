import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import {
  updateTask,
  addTask,
  deleteTask,
  updateWorkflow,
} from '../store/slices/taskSlice';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io(process.env.REACT_APP_WS_URL || 'ws://localhost:3000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    this.socket.on('task:updated', (task) => {
      store.dispatch(updateTask(task));
    });

    this.socket.on('task:created', (task) => {
      store.dispatch(addTask(task));
    });

    this.socket.on('task:deleted', (taskId) => {
      store.dispatch(deleteTask(taskId));
    });

    this.socket.on('workflow:updated', (workflow) => {
      store.dispatch(updateWorkflow(workflow));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToTask(taskId: string) {
    if (this.socket) {
      this.socket.emit('subscribe:task', taskId);
    }
  }

  unsubscribeFromTask(taskId: string) {
    if (this.socket) {
      this.socket.emit('unsubscribe:task', taskId);
    }
  }

  subscribeToWorkflow(workflowId: string) {
    if (this.socket) {
      this.socket.emit('subscribe:workflow', workflowId);
    }
  }

  unsubscribeFromWorkflow(workflowId: string) {
    if (this.socket) {
      this.socket.emit('unsubscribe:workflow', workflowId);
    }
  }
}

export const socketService = new SocketService();

import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { workflowApi } from '../services/api';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 25 },
  },
];

const initialEdges: Edge[] = [];

const WorkflowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newNodeData, setNewNodeData] = useState({ label: '', type: 'default' });

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = () => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      data: { label: newNodeData.label },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setDialogOpen(false);
    setNewNodeData({ label: '', type: 'default' });
  };

  const handleSaveWorkflow = async () => {
    try {
      await workflowApi.createWorkflow({
        nodes,
        edges,
      });
      // Show success message
    } catch (error) {
      // Show error message
      console.error('Error saving workflow:', error);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 100px)' }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">Workflow Builder</Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Add Node
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={handleSaveWorkflow}
            >
              Save Workflow
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ height: 'calc(100% - 100px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        >
          <Controls />
          <Background />
        </ReactFlow>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add New Node</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Node Label"
            fullWidth
            value={newNodeData.label}
            onChange={(e) =>
              setNewNodeData({ ...newNodeData, label: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddNode} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowBuilder;

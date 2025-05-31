// frontend/src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import theme from './theme';
import { socketService } from './services/socket.service';
import { authService } from './services/auth.service';

// Layout and Pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetail';
import TaskForm from './pages/TaskForm';
import WorkflowBuilder from './pages/WorkflowBuilder';
import WorkflowList from './pages/WorkflowList';
import WorkflowDetail from './pages/WorkflowDetail';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function App() {
  useEffect(() => {
    // Initialize WebSocket connection
    socketService.connect();

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              
              {/* Task Routes */}
              <Route path="tasks">
                <Route index element={<TaskList />} />
                <Route path="new" element={<TaskForm />} />
                <Route path=":id" element={<TaskDetail />} />
                <Route path=":id/edit" element={<TaskForm />} />
              </Route>

              {/* Workflow Routes */}
              <Route path="workflows">
                <Route index element={<WorkflowList />} />
                <Route path="new" element={<WorkflowBuilder />} />
                <Route path=":id" element={<WorkflowDetail />} />
                <Route path=":id/edit" element={<WorkflowBuilder />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;

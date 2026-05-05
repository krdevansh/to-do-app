import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import axios from 'axios';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Search, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import AddTaskModal from '../components/AddTaskModal';
import { API_URL } from '../config';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All Tasks');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to load tasks');
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update order in backend
        const token = localStorage.getItem('token');
        const reorderedTasks = newItems.map((item, index) => ({ id: item._id, order: index }));
        
        axios.put(`${API_URL}/tasks/reorder/all`, { tasks: reorderedTasks }, {
            headers: { Authorization: `Bearer ${token}` }
        }).catch(() => toast.error('Failed to save task order'));

        return newItems;
      });
    }
  };

  const toggleTaskStatus = async (id) => {
    const task = tasks.find(t => t._id === id);
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    
    // Play sound if completed
    if (newStatus === 'completed') {
      const audio = new Audio('/success.mp3'); // Mock path, user can add sound later
      audio.play().catch(() => {});
      toast.success('Task completed!', { icon: '🎉' });
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/tasks/${id}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.map(t => t._id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Failed to delete task');
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Tasks' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    pending: filteredTasks.filter(t => t.status === 'pending').length,
  };
  const productivity = stats.total === 0 ? 0 : Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px]" />
      </div>

      <Sidebar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

      <div className="flex-1 md:ml-64 p-6 relative z-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="w-12 h-12 rounded-full border-2 border-primary/50 object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-xl font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">
                {greeting()}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{user?.name}</span>
              </h1>
              <p className="text-gray-400">You have {stats.pending} tasks pending today.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface/50 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            
            <div className="hidden md:flex items-center gap-3 bg-surface/50 border border-white/10 rounded-full px-4 py-2">
              <div className="flex flex-col">
                <span className="text-xs text-gray-400">Productivity</span>
                <span className="text-sm font-bold text-white">{productivity}%</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-primary" />
              </div>
            </div>
          </div>
        </header>

        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="max-w-4xl mx-auto">
            <SortableContext 
              items={filteredTasks.map(t => t._id)}
              strategy={verticalListSortingStrategy}
            >
              <AnimatePresence>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TaskCard 
                      key={task._id} 
                      task={task} 
                      onToggle={toggleTaskStatus}
                      onDelete={deleteTask}
                    />
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-48 h-48 mb-6 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-2xl" />
                      <img src="https://illustrations.popsy.co/amber/taking-notes.svg" alt="Empty state" className="relative z-10 w-full h-full object-contain drop-shadow-2xl opacity-80" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
                    <p className="text-gray-400">You're all caught up! Time to relax or add a new task.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </SortableContext>
          </div>
        </DndContext>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white shadow-[0_0_20px_rgba(138,43,226,0.4)] hover:shadow-[0_0_30px_rgba(138,43,226,0.6)] transition-shadow z-50"
        >
          <Plus className="w-6 h-6" />
        </motion.button>

        <AddTaskModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={(task) => {
            setTasks([task, ...tasks]);
            setIsAddModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

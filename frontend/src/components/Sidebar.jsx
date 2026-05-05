import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, Briefcase, User as UserIcon, BookOpen, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'All Tasks', icon: Home },
  { name: 'Work', icon: Briefcase },
  { name: 'Personal', icon: UserIcon },
  { name: 'Study', icon: BookOpen },
  { name: 'Fitness', icon: Activity },
];

export default function Sidebar({ selectedCategory, setSelectedCategory }) {
  const { logout, user } = useContext(AuthContext);

  return (
    <div className="w-64 glass h-screen fixed left-0 top-0 hidden md:flex flex-col border-r border-white/10">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          TaskFlow
        </h2>
      </div>

      <div className="flex-1 px-4 py-2 space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">Categories</p>
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.name;
          return (
            <button
              key={category.name}
              onClick={() => setSelectedCategory(category.name)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{category.name}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-surface/50 hover:bg-surface transition-colors cursor-pointer group">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-sm font-bold border border-white/10 group-hover:border-primary/50 transition-colors">
            {user?.profilePic ? (
              <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{user?.name}</p>
          </div>
        </Link>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

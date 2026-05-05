import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Image, Activity, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    profilePic: '',
    age: '',
    weight: '',
    height: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        profilePic: user.profilePic || '',
        age: user.age || '',
        weight: user.weight || '',
        height: user.height || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateBMI = () => {
    if (!formData.weight || !formData.height) return null;
    const heightInMeters = formData.height / 100;
    const bmi = formData.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMIStatus = (bmi) => {
    if (!bmi) return { text: '-', color: 'text-gray-400' };
    if (bmi < 18.5) return { text: 'Underweight', color: 'text-blue-400' };
    if (bmi >= 18.5 && bmi < 24.9) return { text: 'Normal', color: 'text-green-400' };
    if (bmi >= 25 && bmi < 29.9) return { text: 'Overweight', color: 'text-yellow-400' };
    return { text: 'Obese', color: 'text-red-400' };
  };

  const bmi = calculateBMI();
  const bmiStatus = getBMIStatus(bmi);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden p-6 md:p-12">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Overview Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass rounded-2xl p-6 text-center h-fit"
          >
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-primary/30 mb-4 bg-surface flex items-center justify-center">
              {formData.profilePic ? (
                <img src={formData.profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                  {formData.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{formData.name}</h2>
            <p className="text-gray-400 mb-6">{user?.email}</p>

            <div className="bg-surface/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-300 mb-2">
                <Activity className="w-5 h-5 text-secondary" />
                <span className="font-semibold">BMI Calculator</span>
              </div>
              <div className="text-3xl font-bold text-white my-2">{bmi || '--'}</div>
              <div className={`text-sm font-medium ${bmiStatus.color}`}>
                {bmiStatus.text}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Based on weight & height
              </div>
            </div>
          </motion.div>

          {/* Edit Profile Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 glass rounded-2xl p-8"
          >
            <h3 className="text-xl font-semibold text-white mb-6">Edit Profile Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-surface/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Profile Image URL</label>
                  <div className="relative">
                    <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                      type="url" 
                      name="profilePic"
                      value={formData.profilePic}
                      onChange={handleChange}
                      placeholder="https://example.com/avatar.png"
                      className="w-full bg-surface/50 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Age</label>
                  <input 
                    type="number" 
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g., 25"
                    className="w-full bg-surface/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Weight (kg)</label>
                  <input 
                    type="number" 
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="e.g., 70"
                    step="0.1"
                    className="w-full bg-surface/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Height (cm)</label>
                  <input 
                    type="number" 
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    placeholder="e.g., 175"
                    className="w-full bg-surface/50 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button 
                  type="submit"
                  className="flex items-center gap-2 py-3 px-6 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium hover:opacity-90 transition-opacity ml-auto"
                >
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Target, Sparkles, Loader2, CheckCircle, Circle, Dumbbell, Apple, Moon, Brain, 
  ChevronRight, Calendar, Clock, TrendingUp, Award, Flame, Droplets, Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmergencyBar from '../components/vetacare/EmergencyBar';
import Navbar from '../components/vetacare/Navbar';
import AIChatbot from '../components/vetacare/AIChatbot';
import { format } from 'date-fns';

const categoryIcons = {
  exercise: Dumbbell,
  nutrition: Apple,
  sleep: Moon,
  mental: Brain,
  general: Target
};

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function HealthPlan() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('HealthPlan'));
        return;
      }

      const user = await base44.auth.me();
      const patients = await base44.entities.Patient.filter({ user_id: user.email });
      
      if (patients.length === 0) {
        navigate(createPageUrl('Onboarding'));
        return;
      }

      setPatient(patients[0]);
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const { data: healthPlans = [], refetch } = useQuery({
    queryKey: ['healthPlans', patient?.id],
    queryFn: () => base44.entities.HealthPlan.filter({ patient_id: patient.id }, '-created_date'),
    enabled: !!patient?.id
  });

  const activePlan = healthPlans.find(p => p.status === 'active');

  const toggleTask = async (taskIndex) => {
    if (!activePlan) return;

    const updatedTasks = [...activePlan.daily_tasks];
    updatedTasks[taskIndex].completed = !updatedTasks[taskIndex].completed;
    
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const progress = Math.round((completedCount / updatedTasks.length) * 100);

    try {
      await base44.entities.HealthPlan.update(activePlan.id, {
        daily_tasks: updatedTasks,
        progress
      });
      refetch();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!activePlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmergencyBar />
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <Target className="w-10 h-10 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Active Health Plan</h1>
            <p className="text-gray-500 mb-6">
              Create a personalized health plan from your dashboard to get started
            </p>
            <Button 
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="bg-gradient-to-r from-purple-500 to-indigo-600"
            >
              Go to Dashboard
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </main>
        <AIChatbot />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmergencyBar />
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="bg-white/20 text-white mb-3">{activePlan.duration_weeks} Week Plan</Badge>
              <h1 className="text-3xl font-bold mb-2">{activePlan.plan_name}</h1>
              <p className="text-purple-100">Goal: {activePlan.goal}</p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="44" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
                  <circle 
                    cx="48" cy="48" r="44" 
                    stroke="white" 
                    strokeWidth="8" 
                    fill="none"
                    strokeDasharray={`${activePlan.progress * 2.76} 276`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{activePlan.progress}%</span>
                </div>
              </div>
              <p className="text-sm text-purple-100 mt-2">Progress</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="tasks">
          <TabsList className="mb-6">
            <TabsTrigger value="tasks">Daily Tasks</TabsTrigger>
            <TabsTrigger value="exercise">Exercise Plan</TabsTrigger>
            <TabsTrigger value="diet">Diet Plan</TabsTrigger>
            <TabsTrigger value="goals">Weekly Goals</TabsTrigger>
          </TabsList>

          {/* Daily Tasks */}
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                  Today's Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activePlan.daily_tasks?.map((task, idx) => {
                    const Icon = categoryIcons[task.category] || Target;
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleTask(idx)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                          task.completed
                            ? 'bg-emerald-50 border-2 border-emerald-200'
                            : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          task.completed ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}>
                          {task.completed ? (
                            <CheckCircle className="w-6 h-6 text-white" />
                          ) : (
                            <Circle className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          task.completed ? 'bg-emerald-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${task.completed ? 'text-emerald-600' : 'text-gray-500'}`} />
                        </div>
                        <span className={`flex-1 text-left font-medium ${
                          task.completed ? 'text-emerald-700 line-through' : 'text-gray-700'
                        }`}>
                          {task.task}
                        </span>
                        {task.completed && (
                          <Badge className="bg-emerald-100 text-emerald-700">Done!</Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exercise Plan */}
          <TabsContent value="exercise">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-orange-500" />
                  Weekly Exercise Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activePlan.exercise_plan?.map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-orange-50 rounded-xl border border-orange-100"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-orange-100 text-orange-700">{item.day}</Badge>
                        <Clock className="w-4 h-4 text-orange-500" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{item.activity}</h4>
                      <p className="text-sm text-orange-600">{item.duration}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diet Plan */}
          <TabsContent value="diet">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-green-500" />
                  Diet Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activePlan.diet_recommendations?.map((rec, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-green-700 font-bold">{idx + 1}</span>
                      </div>
                      <p className="text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Goals */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" />
                  Weekly Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activePlan.weekly_goals?.map((goal, idx) => (
                    <div 
                      key={idx}
                      className="flex items-start gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100"
                    >
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-700 font-bold">W{idx + 1}</span>
                      </div>
                      <div>
                        <Badge className="bg-indigo-100 text-indigo-700 mb-2">Week {idx + 1}</Badge>
                        <p className="text-gray-700 font-medium">{goal}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <AIChatbot />
    </div>
  );
}
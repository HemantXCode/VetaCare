import React, { useState } from 'react';
import { Target, Sparkles, Loader2, CheckCircle, Circle, Dumbbell, Apple, Moon, Brain, ChevronRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const goalOptions = [
  { value: 'weight_loss', label: 'Weight Loss', icon: Target },
  { value: 'muscle_gain', label: 'Build Muscle', icon: Dumbbell },
  { value: 'better_sleep', label: 'Better Sleep', icon: Moon },
  { value: 'stress_reduction', label: 'Reduce Stress', icon: Brain },
  { value: 'healthy_eating', label: 'Healthy Eating', icon: Apple },
  { value: 'general_wellness', label: 'General Wellness', icon: Sparkles }
];

const categoryIcons = {
  exercise: Dumbbell,
  nutrition: Apple,
  sleep: Moon,
  mental: Brain,
  general: Target
};

export default function HealthPlanCard({ healthPlan, patientId, patient, onPlanCreated }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [localPlan, setLocalPlan] = useState(healthPlan);

  const createPersonalizedPlan = async () => {
    if (!selectedGoal) return;

    setCreating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a personalized 4-week health plan for a ${patient?.age || 30} year old patient weighing ${patient?.weight || 70}kg.
        
Goal: ${goalOptions.find(g => g.value === selectedGoal)?.label}
Known Allergies: ${patient?.allergies || 'None'}

Create a comprehensive plan with:
1. A motivating plan name
2. 5 daily tasks (mix of exercise, nutrition, and wellness activities)
3. 4 weekly goals (one per week, progressively challenging)
4. 5 diet recommendations specific to their goal
5. A 7-day exercise plan with specific activities and durations

Make it practical, achievable, and motivating.`,
        response_json_schema: {
          type: "object",
          properties: {
            plan_name: { type: "string" },
            daily_tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  task: { type: "string" },
                  category: { type: "string" }
                }
              }
            },
            weekly_goals: { type: "array", items: { type: "string" } },
            diet_recommendations: { type: "array", items: { type: "string" } },
            exercise_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  activity: { type: "string" },
                  duration: { type: "string" }
                }
              }
            }
          }
        }
      });

      const plan = await base44.entities.HealthPlan.create({
        patient_id: patientId,
        plan_name: response.plan_name,
        goal: goalOptions.find(g => g.value === selectedGoal)?.label,
        duration_weeks: 4,
        daily_tasks: response.daily_tasks.map(t => ({ ...t, completed: false })),
        weekly_goals: response.weekly_goals,
        diet_recommendations: response.diet_recommendations,
        exercise_plan: response.exercise_plan,
        progress: 0,
        status: 'active'
      });

      setLocalPlan(plan);
      setShowCreateDialog(false);
      if (onPlanCreated) onPlanCreated(plan);
    } catch (error) {
      console.error('Plan creation error:', error);
    } finally {
      setCreating(false);
    }
  };

  const toggleTask = async (taskIndex) => {
    if (!localPlan) return;

    const updatedTasks = [...localPlan.daily_tasks];
    updatedTasks[taskIndex].completed = !updatedTasks[taskIndex].completed;
    
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const progress = Math.round((completedCount / updatedTasks.length) * 100);

    try {
      await base44.entities.HealthPlan.update(localPlan.id, {
        daily_tasks: updatedTasks,
        progress
      });
      setLocalPlan({ ...localPlan, daily_tasks: updatedTasks, progress });
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  if (!localPlan) {
    return (
      <>
        <Card className="border-dashed border-2 border-gray-200">
          <CardContent className="py-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full mx-auto flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Personalized Health Plan</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get an AI-generated health plan tailored to your goals
            </p>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create My Plan
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Your Health Plan</DialogTitle>
              <DialogDescription>
                Select your primary health goal and we'll create a personalized plan
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>What's your main health goal?</Label>
                <div className="grid grid-cols-2 gap-3">
                  {goalOptions.map((goal) => {
                    const Icon = goal.icon;
                    return (
                      <button
                        key={goal.value}
                        onClick={() => setSelectedGoal(goal.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          selectedGoal === goal.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${
                          selectedGoal === goal.value ? 'text-purple-600' : 'text-gray-400'
                        }`} />
                        <p className="font-medium text-sm">{goal.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={createPersonalizedPlan}
                disabled={!selectedGoal || creating}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating your plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate My Plan
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {localPlan.plan_name}
            </CardTitle>
            <p className="text-sm text-purple-100 mt-1">Goal: {localPlan.goal}</p>
          </div>
          <Badge className="bg-white/20 text-white">
            {localPlan.duration_weeks} weeks
          </Badge>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{localPlan.progress}%</span>
          </div>
          <Progress value={localPlan.progress} className="h-2 bg-white/20" />
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Daily Tasks */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            Today's Tasks
          </h4>
          <div className="space-y-2">
            {localPlan.daily_tasks?.slice(0, 5).map((task, idx) => {
              const Icon = categoryIcons[task.category] || Target;
              return (
                <button
                  key={idx}
                  onClick={() => toggleTask(idx)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    task.completed
                      ? 'bg-emerald-50 border border-emerald-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    task.completed ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}>
                    {task.completed ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <Icon className={`w-4 h-4 ${task.completed ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className={`flex-1 text-left text-sm ${
                    task.completed ? 'text-emerald-700 line-through' : 'text-gray-700'
                  }`}>
                    {task.task}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Goal */}
        {localPlan.weekly_goals?.length > 0 && (
          <div className="bg-indigo-50 rounded-xl p-4">
            <h4 className="font-medium text-indigo-900 mb-2">This Week's Goal</h4>
            <p className="text-sm text-indigo-700">{localPlan.weekly_goals[0]}</p>
          </div>
        )}

        {/* Quick Diet Tips */}
        {localPlan.diet_recommendations?.length > 0 && (
          <div className="bg-green-50 rounded-xl p-4">
            <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <Apple className="w-4 h-4" />
              Diet Tip
            </h4>
            <p className="text-sm text-green-700">{localPlan.diet_recommendations[0]}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
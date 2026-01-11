import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Leaf, Heart, Brain, Dumbbell, Moon, Apple, Droplets, Sun, ChevronRight, Play, Clock, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import EmergencyBar from '../components/vetacare/EmergencyBar';
import Navbar from '../components/vetacare/Navbar';
import AIChatbot from '../components/vetacare/AIChatbot';

const wellnessCategories = [
  { id: 'nutrition', name: 'Nutrition', icon: Apple, color: 'bg-green-500', articles: 12 },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell, color: 'bg-orange-500', articles: 18 },
  { id: 'mental', name: 'Mental Health', icon: Brain, color: 'bg-purple-500', articles: 15 },
  { id: 'sleep', name: 'Sleep', icon: Moon, color: 'bg-indigo-500', articles: 8 },
  { id: 'hydration', name: 'Hydration', icon: Droplets, color: 'bg-blue-500', articles: 6 },
  { id: 'lifestyle', name: 'Lifestyle', icon: Sun, color: 'bg-yellow-500', articles: 20 },
];

const wellnessArticles = [
  { id: 1, title: '10 Foods That Boost Your Immune System', category: 'nutrition', readTime: 5, image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400' },
  { id: 2, title: '15-Minute Morning Workout Routine', category: 'fitness', readTime: 8, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' },
  { id: 3, title: 'Managing Stress: A Complete Guide', category: 'mental', readTime: 10, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400' },
  { id: 4, title: 'Sleep Better: Science-Backed Tips', category: 'sleep', readTime: 6, image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400' },
  { id: 5, title: 'The Importance of Daily Hydration', category: 'hydration', readTime: 4, image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400' },
  { id: 6, title: 'Building Healthy Habits That Stick', category: 'lifestyle', readTime: 7, image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400' },
];

const dailyTips = [
  "Drink at least 8 glasses of water today",
  "Take a 10-minute walk after lunch",
  "Practice deep breathing for 5 minutes",
  "Eat at least 2 servings of vegetables",
  "Get 7-8 hours of quality sleep tonight"
];

export default function Wellness() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dailyProgress, setDailyProgress] = useState({
    water: 4,
    steps: 6500,
    sleep: 7,
    meals: 2
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('Wellness'));
        return;
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = selectedCategory === 'all' 
    ? wellnessArticles 
    : wellnessArticles.filter(a => a.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmergencyBar />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Wellness Center</h1>
              <p className="text-emerald-100">Your daily guide to a healthier life</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Droplets className="w-5 h-5" />
                <span className="text-sm">{dailyProgress.water}/8 glasses</span>
              </div>
              <Progress value={(dailyProgress.water / 8) * 100} className="h-2 bg-white/20" />
              <p className="text-xs mt-2 text-emerald-100">Water Intake</p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Dumbbell className="w-5 h-5" />
                <span className="text-sm">{dailyProgress.steps.toLocaleString()}/10k</span>
              </div>
              <Progress value={(dailyProgress.steps / 10000) * 100} className="h-2 bg-white/20" />
              <p className="text-xs mt-2 text-emerald-100">Daily Steps</p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Moon className="w-5 h-5" />
                <span className="text-sm">{dailyProgress.sleep}/8 hrs</span>
              </div>
              <Progress value={(dailyProgress.sleep / 8) * 100} className="h-2 bg-white/20" />
              <p className="text-xs mt-2 text-emerald-100">Sleep</p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Apple className="w-5 h-5" />
                <span className="text-sm">{dailyProgress.meals}/3 meals</span>
              </div>
              <Progress value={(dailyProgress.meals / 3) * 100} className="h-2 bg-white/20" />
              <p className="text-xs mt-2 text-emerald-100">Healthy Meals</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <Button
                variant={selectedCategory === 'all' ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={selectedCategory === 'all' ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
              >
                All
              </Button>
              {wellnessCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`whitespace-nowrap ${selectedCategory === cat.id ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {cat.name}
                  </Button>
                );
              })}
            </div>

            {/* Articles */}
            <div className="grid md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => {
                const category = wellnessCategories.find(c => c.id === article.category);
                const Icon = category?.icon || Leaf;
                return (
                  <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-40">
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <Badge className={`absolute top-3 left-3 ${category?.color} text-white`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {category?.name}
                      </Badge>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{article.title}</h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-gray-500 text-sm">
                          <Clock className="w-4 h-4" />
                          {article.readTime} min read
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Daily Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  Daily Wellness Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dailyTips.map((tip, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-600">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl('Dashboard')}>
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2 text-red-500" />
                    Health Checkup
                  </Button>
                </Link>
                <Link to={createPageUrl('Specialists')}>
                  <Button variant="outline" className="w-full justify-start">
                    <Brain className="w-4 h-4 mr-2 text-purple-500" />
                    Talk to a Specialist
                  </Button>
                </Link>
                <Link to={createPageUrl('Hospitals')}>
                  <Button variant="outline" className="w-full justify-start">
                    <Dumbbell className="w-4 h-4 mr-2 text-orange-500" />
                    Find Fitness Centers
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* BMI Calculator Quick */}
            <Card className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Track Your BMI</h3>
                <p className="text-sm text-white/80 mb-4">
                  Keep track of your body mass index for better health insights
                </p>
                <Link to={createPageUrl('PatientCorner')}>
                  <Button variant="secondary" className="w-full">
                    Update Profile
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
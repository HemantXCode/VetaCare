import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Heart, Activity, Apple, Brain, Moon, Scale, 
  Calculator, ChevronRight, Pill, ShoppingBag, 
  CheckCircle, Star, Clock, Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const healthPackages = [
  {
    name: 'Basic Health Checkup',
    price: 999,
    originalPrice: 1499,
    tests: 45,
    includes: ['Blood Sugar', 'Lipid Profile', 'Kidney Function', 'Liver Function', 'Thyroid Profile'],
    popular: false
  },
  {
    name: 'Comprehensive Health Package',
    price: 2499,
    originalPrice: 3999,
    tests: 75,
    includes: ['Complete Blood Count', 'Lipid Profile', 'Kidney & Liver Function', 'Thyroid', 'Vitamin Tests', 'Cardiac Markers'],
    popular: true
  },
  {
    name: 'Executive Health Checkup',
    price: 4999,
    originalPrice: 7999,
    tests: 100,
    includes: ['All Basic Tests', 'Cancer Markers', 'Heart Checkup', 'Bone Density', 'Full Body CT', 'Diet Consultation'],
    popular: false
  },
  {
    name: 'Senior Citizen Package',
    price: 3499,
    originalPrice: 5499,
    tests: 80,
    includes: ['Complete Health Profile', 'Bone Health', 'Heart Assessment', 'Eye Checkup', 'Memory Assessment'],
    popular: false
  }
];

const dietPlans = [
  { name: 'Weight Loss Plan', icon: Scale, color: 'bg-rose-100 text-rose-600', desc: 'Personalized calorie-deficit diet' },
  { name: 'Diabetes Friendly', icon: Apple, color: 'bg-green-100 text-green-600', desc: 'Low GI foods & balanced meals' },
  { name: 'Heart Healthy', icon: Heart, color: 'bg-red-100 text-red-600', desc: 'Low sodium, heart-friendly diet' },
  { name: 'High Protein', icon: Activity, color: 'bg-blue-100 text-blue-600', desc: 'Muscle building nutrition' }
];

const healthTipsData = [
  { title: 'Stay Hydrated', content: 'Drink at least 8 glasses of water daily for optimal health.', category: 'Lifestyle' },
  { title: 'Regular Exercise', content: '30 minutes of moderate exercise 5 times a week can transform your health.', category: 'Exercise' },
  { title: 'Sleep Well', content: '7-8 hours of quality sleep is essential for physical and mental health.', category: 'Sleep' },
  { title: 'Balanced Diet', content: 'Include fruits, vegetables, whole grains, and lean proteins in every meal.', category: 'Nutrition' },
  { title: 'Stress Management', content: 'Practice meditation or deep breathing for 10 minutes daily.', category: 'Mental Health' },
  { title: 'Regular Checkups', content: 'Annual health checkups can help detect issues early.', category: 'Prevention' }
];

export default function Wellness() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);

  const { data: healthTips = [] } = useQuery({
    queryKey: ['health-tips'],
    queryFn: () => base44.entities.HealthTip.list('-created_date', 10)
  });

  const displayTips = healthTips.length > 0 ? healthTips : healthTipsData;

  const calculateBMI = () => {
    if (height && weight) {
      const heightM = parseFloat(height) / 100;
      const bmi = parseFloat(weight) / (heightM * heightM);
      let category = '';
      let color = '';
      
      if (bmi < 18.5) {
        category = 'Underweight';
        color = 'text-blue-600';
      } else if (bmi < 25) {
        category = 'Normal';
        color = 'text-green-600';
      } else if (bmi < 30) {
        category = 'Overweight';
        color = 'text-amber-600';
      } else {
        category = 'Obese';
        color = 'text-red-600';
      }

      setBmiResult({ value: bmi.toFixed(1), category, color });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-700 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Leaf className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Wellness & Prevention
            </h1>
            <p className="text-teal-100 text-lg max-w-2xl mx-auto">
              Take charge of your health with our comprehensive wellness programs, 
              health packages, and preventive care solutions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Tabs defaultValue="packages" className="space-y-8">
            <TabsList className="bg-white shadow-sm">
              <TabsTrigger value="packages">Health Packages</TabsTrigger>
              <TabsTrigger value="bmi">BMI Calculator</TabsTrigger>
              <TabsTrigger value="diet">Diet Plans</TabsTrigger>
              <TabsTrigger value="tips">Health Tips</TabsTrigger>
              <TabsTrigger value="pharmacy">E-Pharmacy</TabsTrigger>
            </TabsList>

            {/* Health Packages */}
            <TabsContent value="packages">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Preventive Health Packages</h2>
                <p className="text-slate-600">Comprehensive health checkups designed for different needs</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {healthPackages.map((pkg, index) => (
                  <motion.div
                    key={pkg.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`h-full relative ${pkg.popular ? 'ring-2 ring-teal-500' : ''}`}>
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-teal-600 text-white">Most Popular</Badge>
                        </div>
                      )}
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg text-slate-800 mb-2">{pkg.name}</h3>
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-3xl font-bold text-teal-600">₹{pkg.price}</span>
                          <span className="text-slate-400 line-through">₹{pkg.originalPrice}</span>
                        </div>
                        <div className="flex items-center gap-2 mb-4 text-slate-600">
                          <Activity className="w-4 h-4" />
                          <span>{pkg.tests} Tests Included</span>
                        </div>
                        <div className="space-y-2 mb-6">
                          {pkg.includes.map(item => (
                            <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full bg-teal-600 hover:bg-teal-700">
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* BMI Calculator */}
            <TabsContent value="bmi">
              <div className="max-w-xl mx-auto">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-teal-600" />
                      BMI Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-6">
                      Body Mass Index (BMI) is a measure of body fat based on height and weight.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label>Height (cm)</Label>
                        <Input
                          type="number"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          placeholder="e.g., 170"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Weight (kg)</Label>
                        <Input
                          type="number"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          placeholder="e.g., 70"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={calculateBMI}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                      disabled={!height || !weight}
                    >
                      Calculate BMI
                    </Button>

                    {bmiResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 p-6 bg-slate-50 rounded-xl text-center"
                      >
                        <p className="text-slate-500 mb-2">Your BMI</p>
                        <p className={`text-5xl font-bold ${bmiResult.color}`}>{bmiResult.value}</p>
                        <p className={`text-lg font-medium mt-2 ${bmiResult.color}`}>{bmiResult.category}</p>
                        
                        <div className="mt-6 grid grid-cols-4 gap-2 text-xs">
                          <div className="p-2 bg-blue-100 rounded text-blue-700">
                            <p className="font-semibold">&lt;18.5</p>
                            <p>Underweight</p>
                          </div>
                          <div className="p-2 bg-green-100 rounded text-green-700">
                            <p className="font-semibold">18.5-24.9</p>
                            <p>Normal</p>
                          </div>
                          <div className="p-2 bg-amber-100 rounded text-amber-700">
                            <p className="font-semibold">25-29.9</p>
                            <p>Overweight</p>
                          </div>
                          <div className="p-2 bg-red-100 rounded text-red-700">
                            <p className="font-semibold">&gt;30</p>
                            <p>Obese</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Diet Plans */}
            <TabsContent value="diet">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Personalized Diet Plans</h2>
                <p className="text-slate-600">Expert-curated nutrition plans for your health goals</p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {dietPlans.map((plan, index) => (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${plan.color}`}>
                            <plan.icon className="w-7 h-7" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-800">{plan.name}</h3>
                            <p className="text-slate-600 mt-1">{plan.desc}</p>
                            <Button className="mt-4" variant="outline">
                              View Plan
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Card className="mt-8">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Apple className="w-8 h-8 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Get a Custom Diet Plan</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Consult with our certified nutritionists for a personalized diet plan 
                    tailored to your health goals and medical conditions.
                  </p>
                  <Link to={createPageUrl('Doctors')}>
                    <Button className="bg-teal-600 hover:bg-teal-700">
                      Book Nutrition Consultation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Tips */}
            <TabsContent value="tips">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Health Tips & Articles</h2>
                <p className="text-slate-600">Expert advice for a healthier lifestyle</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayTips.map((tip, index) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <Badge variant="secondary" className="mb-3">{tip.category}</Badge>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">{tip.title}</h3>
                        <p className="text-slate-600 text-sm">{tip.content}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* E-Pharmacy */}
            <TabsContent value="pharmacy">
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Pill className="w-10 h-10 text-teal-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">VitaCare E-Pharmacy</h2>
                <p className="text-slate-600 max-w-md mx-auto mb-8">
                  Order medicines online and get them delivered to your doorstep. 
                  Flat 20% off on all medicines with free delivery on orders above ₹499.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <ShoppingBag className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-slate-800">50,000+ Products</h3>
                      <p className="text-sm text-slate-500">Medicines & Healthcare</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Clock className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-slate-800">Express Delivery</h3>
                      <p className="text-sm text-slate-500">Within 2-4 hours</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Star className="w-8 h-8 text-teal-600 mx-auto mb-3" />
                      <h3 className="font-semibold text-slate-800">20% Off</h3>
                      <p className="text-sm text-slate-500">On all medicines</p>
                    </CardContent>
                  </Card>
                </div>

                <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Browse Pharmacy
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
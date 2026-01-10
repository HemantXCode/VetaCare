import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, User, Ruler, Weight, Droplet, AlertCircle, 
  ChevronRight, ChevronLeft, CheckCircle, Phone, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const healthConditions = [
  'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 
  'Thyroid', 'Arthritis', 'Cancer', 'Kidney Disease', 'None'
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Onboarding() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    blood_group: '',
    existing_conditions: [],
    allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData(prev => ({
        ...prev,
        full_name: userData.full_name || ''
      }));
    };
    checkAuth();
  }, []);

  // Check if profile exists
  const { data: existingProfiles = [] } = useQuery({
    queryKey: ['health-profile-check', user?.email],
    queryFn: () => base44.entities.HealthProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  useEffect(() => {
    if (existingProfiles.length > 0) {
      const profile = existingProfiles[0];
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age?.toString() || '',
        gender: profile.gender || '',
        height_cm: profile.height_cm?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        blood_group: profile.blood_group || '',
        existing_conditions: profile.existing_conditions || [],
        allergies: profile.allergies?.join(', ') || '',
        emergency_contact_name: profile.emergency_contact_name || '',
        emergency_contact_phone: profile.emergency_contact_phone || ''
      });
    }
  }, [existingProfiles]);

  const handleConditionToggle = (condition) => {
    if (condition === 'None') {
      setFormData(prev => ({
        ...prev,
        existing_conditions: prev.existing_conditions.includes('None') ? [] : ['None']
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        existing_conditions: prev.existing_conditions.includes(condition)
          ? prev.existing_conditions.filter(c => c !== condition && c !== 'None')
          : [...prev.existing_conditions.filter(c => c !== 'None'), condition]
      }));
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);

    const profileData = {
      user_email: user.email,
      full_name: formData.full_name,
      age: parseInt(formData.age),
      gender: formData.gender,
      height_cm: parseFloat(formData.height_cm),
      weight_kg: parseFloat(formData.weight_kg),
      blood_group: formData.blood_group,
      existing_conditions: formData.existing_conditions.filter(c => c !== 'None'),
      allergies: formData.allergies ? formData.allergies.split(',').map(a => a.trim()) : [],
      emergency_contact_name: formData.emergency_contact_name,
      emergency_contact_phone: formData.emergency_contact_phone,
      onboarding_complete: true
    };

    if (existingProfiles.length > 0) {
      await base44.entities.HealthProfile.update(existingProfiles[0].id, profileData);
    } else {
      await base44.entities.HealthProfile.create(profileData);
    }

    setIsSubmitting(false);
    navigate(createPageUrl('Dashboard'));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.full_name && formData.age && formData.gender;
      case 2:
        return formData.height_cm && formData.weight_kg;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-teal-700">Vita</span>
              <span className="text-2xl font-bold text-slate-700">Care</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                step >= s ? 'bg-teal-600 w-8' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Tell us about yourself</h2>
                    <p className="text-slate-500 mt-1">Basic information for your health profile</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        placeholder="Enter your full name"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Age</Label>
                        <Input
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          placeholder="Your age"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <Select 
                          value={formData.gender} 
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-6 bg-teal-600 hover:bg-teal-700"
                    disabled={!canProceed()}
                    onClick={() => setStep(2)}
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Physical Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Ruler className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Physical Details</h2>
                    <p className="text-slate-500 mt-1">Help us calculate your health metrics</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Height (cm)</Label>
                      <Input
                        type="number"
                        value={formData.height_cm}
                        onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                        placeholder="e.g., 170"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Weight (kg)</Label>
                      <Input
                        type="number"
                        value={formData.weight_kg}
                        onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                        placeholder="e.g., 70"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Blood Group</Label>
                      <Select 
                        value={formData.blood_group} 
                        onValueChange={(value) => setFormData({ ...formData, blood_group: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select blood group" />
                        </SelectTrigger>
                        <SelectContent>
                          {bloodGroups.map(bg => (
                            <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      disabled={!canProceed()}
                      onClick={() => setStep(3)}
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Health Conditions */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-8 h-8 text-rose-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Health Conditions</h2>
                    <p className="text-slate-500 mt-1">Select any existing conditions (optional)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {healthConditions.map(condition => (
                      <div
                        key={condition}
                        onClick={() => handleConditionToggle(condition)}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                          formData.existing_conditions.includes(condition)
                            ? 'border-teal-600 bg-teal-50 text-teal-700'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm font-medium">{condition}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label>Allergies (optional)</Label>
                    <Input
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      placeholder="e.g., Penicillin, Peanuts"
                      className="mt-1"
                    />
                    <p className="text-xs text-slate-400 mt-1">Separate multiple allergies with commas</p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      onClick={() => setStep(4)}
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Emergency Contact */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Emergency Contact</h2>
                    <p className="text-slate-500 mt-1">Someone we can contact in case of emergency</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Contact Name</Label>
                      <Input
                        value={formData.emergency_contact_name}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                        placeholder="e.g., John Doe"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Contact Phone</Label>
                      <Input
                        value={formData.emergency_contact_phone}
                        onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                        placeholder="e.g., +91 9876543210"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-teal-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-teal-800">Your data is secure</p>
                        <p className="text-teal-600">
                          Your health information is encrypted and only shared with your doctors.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" onClick={() => setStep(3)}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Complete Setup'}
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
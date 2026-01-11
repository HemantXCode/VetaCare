import React, { useState, useEffect } from 'react';
import { Heart, User, Scale, FileText, Upload, Loader2, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [files, setFiles] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    blood_type: 'Unknown',
    allergies: '',
    emergency_contact: ''
  });

  useEffect(() => {
    checkExistingPatient();
  }, []);

  const checkExistingPatient = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }

      const user = await base44.auth.me();
      const patients = await base44.entities.Patient.filter({ user_id: user.email });
      
      if (patients.length > 0 && patients[0].onboarding_complete) {
        navigate(createPageUrl('Dashboard'));
        return;
      }

      if (user.full_name) {
        setFormData(prev => ({ ...prev, name: user.full_name }));
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      
      // Create patient record
      const patient = await base44.entities.Patient.create({
        user_id: user.email,
        name: formData.name,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        blood_type: formData.blood_type,
        allergies: formData.allergies,
        emergency_contact: formData.emergency_contact,
        onboarding_complete: true
      });

      // Upload medical reports if any
      if (files.length > 0) {
        setUploadingFiles(true);
        for (const file of files) {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          const fileExt = file.name.split('.').pop().toLowerCase();
          
          await base44.entities.MedicalReport.create({
            patient_id: patient.id,
            file_name: file.name,
            file_url,
            file_type: fileExt,
            report_type: 'other',
            report_date: new Date().toISOString().split('T')[0]
          });
        }
      }

      navigate(createPageUrl('Dashboard'));
    } catch (error) {
      console.error('Onboarding error:', error);
    } finally {
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Heart className="w-7 h-7 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">VetaCare</h1>
              <p className="text-sm text-emerald-600">Welcome to your health journey</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                step === s 
                  ? 'bg-emerald-500 text-white scale-110' 
                  : step > s 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-20 h-1 mx-2 rounded ${
                  step > s ? 'bg-emerald-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6" />
                    <div>
                      <h2 className="text-xl font-semibold">Personal Information</h2>
                      <p className="text-emerald-100 text-sm">Let's start with your basic details</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="age">Age (years) *</Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weight">Weight (kg) *</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="70"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blood">Blood Type</Label>
                    <Select
                      value={formData.blood_type}
                      onValueChange={(value) => setFormData({ ...formData, blood_type: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!formData.name || !formData.age || !formData.weight}
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Medical Info */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <Scale className="w-6 h-6" />
                    <div>
                      <h2 className="text-xl font-semibold">Medical Information</h2>
                      <p className="text-emerald-100 text-sm">Optional but helps us serve you better</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Known Allergies</Label>
                    <Input
                      id="allergies"
                      placeholder="e.g., Penicillin, Peanuts, None"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergency">Emergency Contact</Label>
                    <Input
                      id="emergency"
                      placeholder="Phone number"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      className="h-12"
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        Your medical information is securely stored and only used to provide better healthcare recommendations.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12">
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Upload Reports */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6" />
                    <div>
                      <h2 className="text-xl font-semibold">Medical Reports</h2>
                      <p className="text-emerald-100 text-sm">Upload your previous medical records</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Upload Area */}
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-emerald-300 hover:bg-emerald-50/50 transition-all">
                      <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="font-medium text-gray-700">Click to upload files</p>
                      <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG (Max 10MB each)</p>
                    </div>
                  </label>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-emerald-600" />
                            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-sm text-gray-500 text-center">
                    You can skip this step and upload reports later
                  </p>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12">
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {uploadingFiles ? 'Uploading...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          Complete Setup
                          <Check className="w-4 h-4 ml-2" />
                        </>
                      )}
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
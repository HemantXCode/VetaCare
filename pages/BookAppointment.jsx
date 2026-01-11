import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar, Clock, User, Building2, Video, MapPin, Stethoscope, 
  ChevronRight, ChevronLeft, Check, Loader2, Sparkles, AlertCircle,
  FileText, Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays } from 'date-fns';
import EmergencyBar from '../components/vetacare/EmergencyBar';
import Navbar from '../components/vetacare/Navbar';
import AIChatbot from '../components/vetacare/AIChatbot';

const doctors = [
  { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', experience: 15, rating: 4.9, fee: 150, hospital: 'Metro Medical Center', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150', available: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
  { id: 2, name: 'Dr. Michael Chen', specialty: 'Dermatologist', experience: 12, rating: 4.8, fee: 120, hospital: 'City General Hospital', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150', available: ['10:00', '11:30', '13:00', '16:00'] },
  { id: 3, name: 'Dr. Emily Davis', specialty: 'Pediatrician', experience: 10, rating: 4.9, fee: 100, hospital: "Children's Hospital", image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150', available: ['09:30', '11:00', '14:30', '16:30'] },
  { id: 4, name: 'Dr. James Wilson', specialty: 'Orthopedic', experience: 20, rating: 4.7, fee: 180, hospital: 'Metro Medical Center', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150', available: ['08:00', '10:30', '13:30', '15:30'] },
  { id: 5, name: 'Dr. Lisa Thompson', specialty: 'Neurologist', experience: 18, rating: 4.8, fee: 200, hospital: 'Neuro Institute', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150', available: ['09:00', '11:30', '14:00', '17:00'] },
  { id: 6, name: 'Dr. Robert Martinez', specialty: 'General Physician', experience: 8, rating: 4.6, fee: 80, hospital: 'Community Health Clinic', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150', available: ['08:30', '10:00', '12:00', '15:00', '17:30'] },
  { id: 7, name: 'Dr. Jennifer Lee', specialty: 'Gynecologist', experience: 14, rating: 4.9, fee: 130, hospital: "Women's Health Center", image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150', available: ['09:00', '11:00', '14:00', '16:00'] },
  { id: 8, name: 'Dr. David Brown', specialty: 'Psychiatrist', experience: 16, rating: 4.7, fee: 160, hospital: 'Mental Wellness Center', image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150', available: ['10:00', '12:00', '15:00', '17:00'] },
];

const specialties = ['All', 'General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedic', 'Neurologist', 'Gynecologist', 'Psychiatrist'];

const timeSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

export default function BookAppointment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState(null);

  const [formData, setFormData] = useState({
    specialty: 'All',
    doctor: null,
    appointmentType: 'in_person',
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    time: '',
    symptoms: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('BookAppointment'));
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

  // Fetch patient's diagnosis history for AI suggestions
  const { data: diagnoses = [] } = useQuery({
    queryKey: ['diagnoses', patient?.id],
    queryFn: () => base44.entities.AIDiagnosis.filter({ patient_id: patient.id }, '-created_date', 5),
    enabled: !!patient?.id
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['reports', patient?.id],
    queryFn: () => base44.entities.MedicalReport.filter({ patient_id: patient.id }, '-created_date', 5),
    enabled: !!patient?.id
  });

  const filteredDoctors = formData.specialty === 'All' 
    ? doctors 
    : doctors.filter(d => d.specialty === formData.specialty);

  const getAISuggestion = async () => {
    if (!formData.symptoms && diagnoses.length === 0) return;
    
    setAiSuggesting(true);
    try {
      const diagnosisHistory = diagnoses.map(d => `${d.condition} (${d.severity} severity)`).join(', ');
      const reportTypes = reports.map(r => r.report_type).join(', ');

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on the following patient information, suggest the most appropriate medical specialist:

Patient Symptoms: ${formData.symptoms || 'Not specified'}
Previous Diagnoses: ${diagnosisHistory || 'None'}
Medical Reports: ${reportTypes || 'None'}
Patient Age: ${patient?.age || 'Unknown'}
Patient Allergies: ${patient?.allergies || 'None'}

From this list of available specialists, suggest the TOP 2 most relevant:
- General Physician
- Cardiologist
- Dermatologist
- Pediatrician
- Orthopedic
- Neurologist
- Gynecologist
- Psychiatrist

Provide a brief explanation for each suggestion.`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  specialty: { type: "string" },
                  reason: { type: "string" },
                  priority: { type: "number" }
                }
              }
            },
            general_advice: { type: "string" }
          }
        }
      });

      setAiSuggestion(response);
    } catch (error) {
      console.error('AI suggestion error:', error);
    } finally {
      setAiSuggesting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.doctor || !formData.date || !formData.time) return;

    setSubmitting(true);
    try {
      const appointment = await base44.entities.Appointment.create({
        patient_id: patient.id,
        doctor_name: formData.doctor.name,
        doctor_specialty: formData.doctor.specialty,
        hospital: formData.doctor.hospital,
        appointment_type: formData.appointmentType,
        appointment_date: formData.date,
        appointment_time: formData.time,
        symptoms: formData.symptoms,
        status: 'confirmed',
        consultation_fee: formData.doctor.fee
      });

      setCreatedAppointment(appointment);
      setBookingComplete(true);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };

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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Book an Appointment</h1>
          <p className="text-gray-500">Schedule a consultation with our specialists</p>
        </div>

        {/* Progress Steps */}
        {!bookingComplete && (
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3, 4].map((s) => (
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
                {s < 4 && (
                  <div className={`w-16 h-1 mx-2 rounded ${
                    step > s ? 'bg-emerald-500' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Symptoms & AI Suggestion */}
          {step === 1 && !bookingComplete && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    Describe Your Symptoms
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="symptoms">What brings you in today? (Optional)</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Describe your symptoms, concerns, or reason for visit..."
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      className="mt-2 h-32"
                    />
                  </div>

                  {/* AI Suggestion Button */}
                  <Button
                    variant="outline"
                    onClick={getAISuggestion}
                    disabled={aiSuggesting}
                    className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    {aiSuggesting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        AI is analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get AI Doctor Recommendation
                      </>
                    )}
                  </Button>

                  {/* AI Suggestion Results */}
                  {aiSuggestion && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <Alert className="bg-purple-50 border-purple-200">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <AlertDescription className="text-purple-800">
                          <strong>AI Recommendation:</strong> {aiSuggestion.general_advice}
                        </AlertDescription>
                      </Alert>

                      <div className="grid md:grid-cols-2 gap-3">
                        {aiSuggestion.suggestions?.map((suggestion, idx) => (
                          <div
                            key={idx}
                            onClick={() => setFormData({ ...formData, specialty: suggestion.specialty })}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              formData.specialty === suggestion.specialty
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-200 hover:border-emerald-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{suggestion.specialty}</span>
                              <Badge className={idx === 0 ? 'bg-emerald-500' : 'bg-gray-500'}>
                                #{idx + 1} Match
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{suggestion.reason}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Select Doctor */}
          {step === 2 && !bookingComplete && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-emerald-600" />
                    Select a Doctor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Specialty Filter */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {specialties.map((spec) => (
                      <Button
                        key={spec}
                        variant={formData.specialty === spec ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({ ...formData, specialty: spec, doctor: null })}
                        className={`whitespace-nowrap ${formData.specialty === spec ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                      >
                        {spec}
                      </Button>
                    ))}
                  </div>

                  {/* Doctor List */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {filteredDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        onClick={() => setFormData({ ...formData, doctor })}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          formData.doctor?.id === doctor.id
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="w-14 h-14">
                            <AvatarImage src={doctor.image} />
                            <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-semibold">{doctor.name}</h3>
                              <Badge variant="secondary">${doctor.fee}</Badge>
                            </div>
                            <p className="text-sm text-emerald-600">{doctor.specialty}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                              <span>{doctor.experience} yrs exp</span>
                              <span>⭐ {doctor.rating}</span>
                              <span className="flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {doctor.hospital}
                              </span>
                            </div>
                          </div>
                          {formData.doctor?.id === doctor.id && (
                            <Check className="w-6 h-6 text-emerald-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!formData.doctor}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Select Date, Time & Type */}
          {step === 3 && !bookingComplete && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    Select Date & Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Appointment Type */}
                  <div>
                    <Label className="mb-3 block">Appointment Type</Label>
                    <RadioGroup
                      value={formData.appointmentType}
                      onValueChange={(value) => setFormData({ ...formData, appointmentType: value })}
                      className="flex gap-4"
                    >
                      <div className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.appointmentType === 'in_person' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="in_person" id="in_person" />
                          <Label htmlFor="in_person" className="flex items-center gap-2 cursor-pointer">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="font-medium">In-Person</p>
                              <p className="text-xs text-gray-500">Visit the clinic</p>
                            </div>
                          </Label>
                        </div>
                      </div>
                      <div className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.appointmentType === 'video' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="video" id="video" />
                          <Label htmlFor="video" className="flex items-center gap-2 cursor-pointer">
                            <Video className="w-5 h-5 text-purple-500" />
                            <div>
                              <p className="font-medium">Video Call</p>
                              <p className="text-xs text-gray-500">Online consultation</p>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Date Selection */}
                  <div>
                    <Label className="mb-3 block">Select Date</Label>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {generateDates().map((date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isSelected = formData.date === dateStr;
                        return (
                          <button
                            key={dateStr}
                            onClick={() => setFormData({ ...formData, date: dateStr, time: '' })}
                            className={`flex-shrink-0 p-3 rounded-lg text-center min-w-[80px] transition-all ${
                              isSelected
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <p className="text-xs">{format(date, 'EEE')}</p>
                            <p className="text-lg font-bold">{format(date, 'd')}</p>
                            <p className="text-xs">{format(date, 'MMM')}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div>
                    <Label className="mb-3 block">Select Time</Label>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {timeSlots.map((time) => {
                        const isAvailable = formData.doctor?.available?.includes(time);
                        const isSelected = formData.time === time;
                        return (
                          <button
                            key={time}
                            onClick={() => isAvailable && setFormData({ ...formData, time })}
                            disabled={!isAvailable}
                            className={`p-2 rounded-lg text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-emerald-500 text-white'
                                : isAvailable
                                  ? 'bg-gray-100 hover:bg-emerald-100'
                                  : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(4)}
                      disabled={!formData.time}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Review & Confirm */}
          {step === 4 && !bookingComplete && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-600" />
                    Review & Confirm
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Doctor Info */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={formData.doctor?.image} />
                        <AvatarFallback>{formData.doctor?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{formData.doctor?.name}</h3>
                        <p className="text-emerald-600">{formData.doctor?.specialty}</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {formData.doctor?.hospital}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Date & Time</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {format(new Date(formData.date), 'EEEE, MMMM d, yyyy')}
                      </p>
                      <p className="text-blue-600">{formData.time}</p>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {formData.appointmentType === 'video' ? (
                          <Video className="w-5 h-5 text-purple-600" />
                        ) : (
                          <MapPin className="w-5 h-5 text-purple-600" />
                        )}
                        <span className="font-medium">Appointment Type</span>
                      </div>
                      <p className="text-lg font-semibold">
                        {formData.appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                      </p>
                    </div>
                  </div>

                  {formData.symptoms && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-amber-600" />
                        <span className="font-medium">Symptoms</span>
                      </div>
                      <p className="text-gray-700">{formData.symptoms}</p>
                    </div>
                  )}

                  {/* Fee */}
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Consultation Fee</span>
                      <span className="text-2xl font-bold text-emerald-600">${formData.doctor?.fee}</span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setStep(3)}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="bg-emerald-500 hover:bg-emerald-600"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        <>
                          Confirm Booking
                          <Check className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Booking Confirmation */}
          {bookingComplete && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="text-center">
                <CardContent className="py-12">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center mb-6">
                    <Check className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Appointment Booked!</h2>
                  <p className="text-gray-500 mb-8">Your appointment has been confirmed successfully</p>

                  <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto text-left space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={formData.doctor?.image} />
                        <AvatarFallback>{formData.doctor?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{formData.doctor?.name}</p>
                        <p className="text-sm text-emerald-600">{formData.doctor?.specialty}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-medium">{format(new Date(formData.date), 'MMM d, yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-medium">{formData.time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Mode</p>
                        <p className="font-medium">{formData.appointmentType === 'video' ? 'Video Call' : 'In-Person'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <Badge className="bg-emerald-100 text-emerald-700">Confirmed</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center mt-8">
                    <Button variant="outline" onClick={() => navigate(createPageUrl('Dashboard'))}>
                      Go to Dashboard
                    </Button>
                    <Button 
                      className="bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => {
                        setBookingComplete(false);
                        setStep(1);
                        setFormData({
                          specialty: 'All',
                          doctor: null,
                          appointmentType: 'in_person',
                          date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
                          time: '',
                          symptoms: ''
                        });
                        setAiSuggestion(null);
                      }}
                    >
                      Book Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AIChatbot />
    </div>
  );
}
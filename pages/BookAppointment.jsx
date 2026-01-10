import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, ArrowLeft, ArrowRight, CheckCircle, 
  Stethoscope, Building2, CreditCard, User, Phone, Mail,
  MessageCircle, Star, Bell, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'
];

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const doctorIdParam = searchParams.get('doctorId');
  const hospitalIdParam = searchParams.get('hospitalId');

  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const queryClient = useQueryClient();

  // Get user
  useEffect(() => {
    const getUser = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }
    };
    getUser();
  }, []);

  // Fetch doctors
  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors-booking'],
    queryFn: () => base44.entities.Doctor.list('-rating', 100)
  });

  // Pre-select doctor if provided
  useEffect(() => {
    if (doctorIdParam && doctors.length > 0) {
      const doctor = doctors.find(d => d.id === doctorIdParam);
      if (doctor) {
        setSelectedDoctor(doctor);
        setStep(2);
      }
    }
  }, [doctorIdParam, doctors]);

  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i + 1));

  // Create appointment mutation
  const createAppointment = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Appointment.create(data);
    },
    onSuccess: (data) => {
      setBookingDetails(data);
      setBookingComplete(true);
      queryClient.invalidateQueries(['appointments']);
    }
  });

  const handleSubmit = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    setIsSubmitting(true);

    const appointmentData = {
      patient_email: user.email,
      patient_name: user.full_name,
      doctor_id: selectedDoctor.id,
      doctor_name: selectedDoctor.name,
      hospital_id: selectedDoctor.hospital_id,
      hospital_name: selectedDoctor.hospital_name,
      specialization: selectedDoctor.specialization,
      appointment_date: format(selectedDate, 'yyyy-MM-dd'),
      appointment_time: selectedTime,
      consultation_fee: selectedDoctor.consultation_fee || 500,
      symptoms: symptoms,
      status: 'scheduled'
    };

    await createAppointment.mutateAsync(appointmentData);
    setIsSubmitting(false);
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-12 h-12 text-green-500" />
              </motion.div>
              <h1 className="text-2xl font-bold mb-2">Appointment Confirmed!</h1>
              <p className="text-green-100">Your appointment has been successfully scheduled</p>
            </div>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <Stethoscope className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Doctor</p>
                    <p className="font-semibold text-slate-800">Dr. {selectedDoctor.name}</p>
                    <p className="text-sm text-teal-600">{selectedDoctor.specialization}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <p className="text-sm text-slate-500">Date</p>
                    </div>
                    <p className="font-semibold text-slate-800">
                      {format(selectedDate, 'dd MMM yyyy')}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <p className="text-sm text-slate-500">Time</p>
                    </div>
                    <p className="font-semibold text-slate-800">{selectedTime}</p>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">Notifications Sent</p>
                      <p className="text-amber-700">
                        Confirmation sent to {user?.email}. You'll also receive an SMS reminder before your appointment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link to={createPageUrl('Dashboard')} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View My Appointments
                    </Button>
                  </Link>
                  <Link to={createPageUrl('Home')} className="flex-1">
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to={createPageUrl('Doctors')} className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Doctors
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">Book Appointment</h1>
          <p className="text-slate-600 mt-2">Schedule your consultation in a few simple steps</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[
            { num: 1, label: 'Select Doctor' },
            { num: 2, label: 'Date & Time' },
            { num: 3, label: 'Confirm' }
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= s.num ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <span className={`hidden sm:block font-medium ${
                  step >= s.num ? 'text-teal-600' : 'text-slate-400'
                }`}>{s.label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-1 mx-4 rounded ${step > s.num ? 'bg-teal-600' : 'bg-slate-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Select Doctor */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Select a Doctor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                    {doctors.slice(0, 20).map(doctor => (
                      <div
                        key={doctor.id}
                        onClick={() => {
                          setSelectedDoctor(doctor);
                          setStep(2);
                        }}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedDoctor?.id === doctor.id
                            ? 'border-teal-600 bg-teal-50'
                            : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="w-14 h-14 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xl font-bold text-teal-600">
                              {doctor.name?.charAt(0)}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-800 truncate">Dr. {doctor.name}</h3>
                            <p className="text-sm text-teal-600">{doctor.specialization}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Star className="w-4 h-4 text-amber-500 fill-current" />
                              <span className="text-sm text-slate-600">{doctor.rating || '4.8'}</span>
                              <span className="text-sm text-slate-400">•</span>
                              <span className="text-sm font-medium text-slate-700">₹{doctor.consultation_fee || '500'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Select Date & Time */}
          {step === 2 && selectedDoctor && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Select Date & Time</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Stethoscope className="w-4 h-4" />
                      Dr. {selectedDoctor.name}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Date Selection */}
                  <div className="mb-6">
                    <Label className="text-base font-semibold mb-3 block">Choose Date</Label>
                    <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                      {availableDates.map(date => (
                        <button
                          key={date.toISOString()}
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-xl text-center transition-all ${
                            selectedDate?.toDateString() === date.toDateString()
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 hover:bg-teal-50 text-slate-700'
                          }`}
                        >
                          <p className="text-xs opacity-70">{format(date, 'EEE')}</p>
                          <p className="text-lg font-semibold">{format(date, 'd')}</p>
                          <p className="text-xs opacity-70">{format(date, 'MMM')}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="mb-6">
                    <Label className="text-base font-semibold mb-3 block">Choose Time</Label>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`p-2 rounded-lg text-sm font-medium transition-all ${
                            selectedTime === slot
                              ? 'bg-teal-600 text-white'
                              : 'bg-slate-100 hover:bg-teal-50 text-slate-700'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button 
                      className="flex-1 bg-teal-600 hover:bg-teal-700"
                      disabled={!selectedDate || !selectedTime}
                      onClick={() => setStep(3)}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Additional Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Describe your symptoms (optional)</Label>
                        <Textarea
                          placeholder="Briefly describe what you're experiencing..."
                          value={symptoms}
                          onChange={(e) => setSymptoms(e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                      </div>

                      {!user && (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-800">Login Required</p>
                              <p className="text-sm text-amber-700">
                                Please login to complete your booking.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setStep(2)}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button 
                          className="flex-1 bg-teal-600 hover:bg-teal-700"
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Summary */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Booking Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                          <span className="text-lg font-bold text-teal-600">
                            {selectedDoctor?.name?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">Dr. {selectedDoctor?.name}</p>
                          <p className="text-sm text-teal-600">{selectedDoctor?.specialization}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Date</span>
                          <span className="font-medium text-slate-800">
                            {selectedDate && format(selectedDate, 'dd MMM yyyy')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Time</span>
                          <span className="font-medium text-slate-800">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Hospital</span>
                          <span className="font-medium text-slate-800 text-right text-sm">
                            {selectedDoctor?.hospital_name || 'VitaCare'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800">Consultation Fee</span>
                          <span className="text-xl font-bold text-teal-600">
                            ₹{selectedDoctor?.consultation_fee || '500'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
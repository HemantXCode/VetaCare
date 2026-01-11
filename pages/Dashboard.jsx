import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, User } from 'lucide-react';

import EmergencyBar from '../components/vetacare/EmergencyBar';
import Navbar from '../components/vetacare/Navbar';
import AIChatbot from '../components/vetacare/AIChatbot';
import MedicalReportsCard from '../components/vetacare/MedicalReportsCard';
import AIDiagnosisCard from '../components/vetacare/AIDiagnosisCard';
import EmergencyCard from '../components/vetacare/EmergencyCard';
import HealthCheckupCard from '../components/vetacare/HealthCheckupCard';
import QuickStats from '../components/vetacare/QuickStats';
import UpcomingAppointments from '../components/vetacare/UpcomingAppointments';
import HealthPlanCard from '../components/vetacare/HealthPlanCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndPatient();
  }, []);

  const checkAuthAndPatient = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('Dashboard'));
        return;
      }

      const user = await base44.auth.me();
      const patients = await base44.entities.Patient.filter({ user_id: user.email });
      
      if (patients.length === 0 || !patients[0].onboarding_complete) {
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

  const { data: reports = [], refetch: refetchReports } = useQuery({
    queryKey: ['reports', patient?.id],
    queryFn: () => base44.entities.MedicalReport.filter({ patient_id: patient.id }),
    enabled: !!patient?.id
  });

  const { data: diagnoses = [] } = useQuery({
    queryKey: ['diagnoses', patient?.id],
    queryFn: () => base44.entities.AIDiagnosis.filter({ patient_id: patient.id }),
    enabled: !!patient?.id
  });

  const { data: checkups = [] } = useQuery({
    queryKey: ['checkups', patient?.id],
    queryFn: () => base44.entities.HealthCheckup.filter({ patient_id: patient.id }),
    enabled: !!patient?.id
  });

  const { data: appointments = [], refetch: refetchAppointments } = useQuery({
    queryKey: ['appointments', patient?.id],
    queryFn: () => base44.entities.Appointment.filter({ patient_id: patient.id }, '-appointment_date'),
    enabled: !!patient?.id
  });

  const { data: healthPlans = [], refetch: refetchHealthPlans } = useQuery({
    queryKey: ['healthPlans', patient?.id],
    queryFn: () => base44.entities.HealthPlan.filter({ patient_id: patient.id, status: 'active' }),
    enabled: !!patient?.id
  });

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
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {patient?.name?.split(' ')[0]}!
              </h1>
              <p className="text-gray-500">Here's your health dashboard overview</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <QuickStats 
          reports={reports} 
          diagnoses={diagnoses} 
          checkups={checkups} 
        />

        {/* Upcoming Appointments */}
        <div className="mt-8">
          <UpcomingAppointments appointments={appointments} />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          {/* Left Column */}
          <div className="space-y-6">
            <MedicalReportsCard 
              reports={reports} 
              patientId={patient?.id}
              onReportsChange={refetchReports}
            />
            <HealthPlanCard 
              healthPlan={healthPlans[0]} 
              patientId={patient?.id}
              patient={patient}
              onPlanCreated={refetchHealthPlans}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AIDiagnosisCard patientId={patient?.id} />
            <HealthCheckupCard patientId={patient?.id} />
            <EmergencyCard patientId={patient?.id} />
          </div>
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
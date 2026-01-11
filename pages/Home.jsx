import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Heart, Loader2 } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      
      if (!isAuth) {
        // Not logged in, redirect to onboarding which will handle login
        navigate(createPageUrl('Onboarding'));
        return;
      }

      // Check if patient exists
      const user = await base44.auth.me();
      const patients = await base44.entities.Patient.filter({ user_id: user.email });
      
      if (patients.length === 0 || !patients[0].onboarding_complete) {
        navigate(createPageUrl('Onboarding'));
      } else {
        navigate(createPageUrl('Dashboard'));
      }
    } catch (error) {
      console.error('Auth check error:', error);
      navigate(createPageUrl('Onboarding'));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
          <Heart className="w-10 h-10 text-white" fill="white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">VetaCare 2.0</h1>
        <p className="text-gray-500 mb-8">Your Complete Healthcare Companion</p>
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
        <p className="text-sm text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}
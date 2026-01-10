import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Building2, Stethoscope, MapPin, 
  FileText, Heart, Activity, User, Settings, 
  ChevronRight, Star, Phone, AlertCircle, CheckCircle,
  XCircle, CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { format, isAfter, isBefore } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(window.location.href);
        return;
      }
      const userData = await base44.auth.me();
      setUser(userData);
    };
    checkAuth();
  }, []);

  // Get health profile
  const { data: profiles = [] } = useQuery({
    queryKey: ['health-profile', user?.email],
    queryFn: () => base44.entities.HealthProfile.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  useEffect(() => {
    if (profiles.length > 0) {
      setHealthProfile(profiles[0]);
    }
  }, [profiles]);

  // Get user's appointments
  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['user-appointments', user?.email],
    queryFn: () => base44.entities.Appointment.filter({ patient_email: user?.email }, '-appointment_date'),
    enabled: !!user?.email
  });

  // Get nearby hospitals
  const { data: hospitals = [] } = useQuery({
    queryKey: ['nearby-hospitals'],
    queryFn: () => base44.entities.Hospital.list('-rating', 6)
  });

  const upcomingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled' && isAfter(new Date(apt.appointment_date), new Date())
  );

  const pastAppointments = appointments.filter(apt => 
    apt.status !== 'scheduled' || isBefore(new Date(apt.appointment_date), new Date())
  );

  const statusColors = {
    scheduled: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    'no-show': 'bg-slate-100 text-slate-700'
  };

  const statusIcons = {
    scheduled: CalendarClock,
    completed: CheckCircle,
    cancelled: XCircle,
    'no-show': AlertCircle
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Check if onboarding is needed
  if (!healthProfile?.onboarding_complete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Complete Your Profile</h2>
            <p className="text-slate-600 mb-6">
              Please complete your health profile to get personalized healthcare recommendations.
            </p>
            <Link to={createPageUrl('Onboarding')}>
              <Button className="w-full bg-teal-600 hover:bg-teal-700">
                Complete Profile
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Welcome, {user.full_name || 'Patient'}
            </h1>
            <p className="text-slate-600">Manage your appointments and health records</p>
          </div>
          <div className="flex gap-3">
            <Link to={createPageUrl('BookAppointment')}>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-teal-500 to-teal-600 text-white">
              <CardContent className="p-6">
                <Calendar className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
                <p className="text-teal-100">Upcoming</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-3xl font-bold">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
                <p className="text-blue-100">Completed</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-6">
                <Activity className="w-8 h-8 mb-2 text-rose-500" />
                <p className="text-3xl font-bold text-slate-800">
                  {healthProfile?.weight_kg && healthProfile?.height_cm
                    ? (healthProfile.weight_kg / Math.pow(healthProfile.height_cm / 100, 2)).toFixed(1)
                    : '--'}
                </p>
                <p className="text-slate-500">BMI</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent className="p-6">
                <Heart className="w-8 h-8 mb-2 text-red-500" />
                <p className="text-3xl font-bold text-slate-800">{healthProfile?.blood_group || '--'}</p>
                <p className="text-slate-500">Blood Group</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Appointments</span>
                  <Link to={createPageUrl('BookAppointment')}>
                    <Button size="sm" variant="outline">
                      Book New
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">
                      Upcoming ({upcomingAppointments.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                      Past ({pastAppointments.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming">
                    {appointmentsLoading ? (
                      <div className="space-y-4">
                        {[1,2].map(i => (
                          <Skeleton key={i} className="h-24 w-full rounded-xl" />
                        ))}
                      </div>
                    ) : upcomingAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {upcomingAppointments.map(apt => {
                          const StatusIcon = statusIcons[apt.status];
                          return (
                            <div key={apt.id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Stethoscope className="w-6 h-6 text-teal-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="font-semibold text-slate-800">Dr. {apt.doctor_name}</h4>
                                      <p className="text-sm text-teal-600">{apt.specialization}</p>
                                    </div>
                                    <Badge className={statusColors[apt.status]}>
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {apt.status}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {format(new Date(apt.appointment_date), 'dd MMM yyyy')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      {apt.appointment_time}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Building2 className="w-4 h-4" />
                                      {apt.hospital_name || 'VitaCare'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No upcoming appointments</p>
                        <Link to={createPageUrl('BookAppointment')}>
                          <Button className="mt-4 bg-teal-600 hover:bg-teal-700">
                            Book Appointment
                          </Button>
                        </Link>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="past">
                    {pastAppointments.length > 0 ? (
                      <div className="space-y-4">
                        {pastAppointments.slice(0, 5).map(apt => {
                          const StatusIcon = statusIcons[apt.status];
                          return (
                            <div key={apt.id} className="p-4 bg-slate-50 rounded-xl">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Stethoscope className="w-6 h-6 text-slate-500" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h4 className="font-semibold text-slate-800">Dr. {apt.doctor_name}</h4>
                                      <p className="text-sm text-slate-500">{apt.specialization}</p>
                                    </div>
                                    <Badge className={statusColors[apt.status]}>
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {apt.status}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-slate-400 mt-1">
                                    {format(new Date(apt.appointment_date), 'dd MMM yyyy')} • {apt.appointment_time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No past appointments</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Nearby Hospitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Nearby Hospitals</span>
                  <Link to={createPageUrl('Hospitals')}>
                    <Button size="sm" variant="outline">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {hospitals.slice(0, 4).map(hospital => (
                    <Link 
                      key={hospital.id}
                      to={`${createPageUrl('HospitalDetail')}?id=${hospital.id}`}
                      className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={hospital.image_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=200&q=80"}
                            alt={hospital.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-800 truncate group-hover:text-teal-600">
                            {hospital.name}
                          </h4>
                          <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {hospital.city}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-500 fill-current" />
                              <span className="text-sm font-medium">{hospital.rating || '4.5'}</span>
                            </div>
                            <span className="text-slate-300">•</span>
                            <span className="text-sm text-teal-600">2.5 km</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Health Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Health Profile</span>
                  <Link to={createPageUrl('Onboarding')}>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                  <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{healthProfile?.full_name || user.full_name}</p>
                    <p className="text-sm text-slate-500">{healthProfile?.age} years • {healthProfile?.gender}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Height</span>
                    <span className="font-medium text-slate-800">{healthProfile?.height_cm} cm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weight</span>
                    <span className="font-medium text-slate-800">{healthProfile?.weight_kg} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Blood Group</span>
                    <span className="font-medium text-slate-800">{healthProfile?.blood_group || '--'}</span>
                  </div>
                </div>

                {healthProfile?.existing_conditions?.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-slate-500 mb-2">Health Conditions</p>
                    <div className="flex flex-wrap gap-2">
                      {healthProfile.existing_conditions.map(cond => (
                        <Badge key={cond} variant="secondary">{cond}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={createPageUrl('Doctors')} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Stethoscope className="w-4 h-4 mr-3" />
                    Find a Doctor
                  </Button>
                </Link>
                <Link to={createPageUrl('Hospitals')} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="w-4 h-4 mr-3" />
                    Find Hospital
                  </Button>
                </Link>
                <Link to={createPageUrl('Wellness')} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-3" />
                    Health Packages
                  </Button>
                </Link>
                <Link to={createPageUrl('ScanDisease')} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-3" />
                    AI Health Scan
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">Emergency</p>
                    <p className="text-sm text-red-600">24/7 Available</p>
                  </div>
                </div>
                <a href="tel:1800-123-4567">
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Call 1800-123-4567
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
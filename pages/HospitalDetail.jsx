import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  MapPin, Star, Phone, Clock, ChevronRight, Mail, Globe,
  Building2, Bed, Stethoscope, Award, Users, Calendar, 
  CheckCircle, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function HospitalDetail() {
  const [searchParams] = useSearchParams();
  const hospitalId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: hospital, isLoading } = useQuery({
    queryKey: ['hospital', hospitalId],
    queryFn: async () => {
      const hospitals = await base44.entities.Hospital.filter({ id: hospitalId });
      return hospitals[0];
    },
    enabled: !!hospitalId
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['hospital-doctors', hospitalId],
    queryFn: () => base44.entities.Doctor.filter({ hospital_id: hospitalId }),
    enabled: !!hospitalId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-80 w-full rounded-2xl mb-8" />
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Hospital not found</h2>
          <Link to={createPageUrl('Hospitals')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Hospitals
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const mapCenter = [hospital.latitude || 28.6139, hospital.longitude || 77.2090];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Image */}
      <section className="relative h-80 md:h-96 overflow-hidden">
        <img 
          src={hospital.image_url || "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=1200&q=80"}
          alt={hospital.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <Link to={createPageUrl('Hospitals')} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Hospitals
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{hospital.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/90">
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {hospital.city}, {hospital.state}
              </span>
              <span className="flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-current" />
                {hospital.rating || '4.5'} Rating
              </span>
              {hospital.accreditations?.map(acc => (
                <Badge key={acc} className="bg-teal-600 text-white">{acc}</Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-white shadow-sm mb-6">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="doctors">Doctors ({doctors.length})</TabsTrigger>
                  <TabsTrigger value="specialities">Specialities</TabsTrigger>
                  <TabsTrigger value="facilities">Facilities</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-slate-800 mb-4">About {hospital.name}</h2>
                      <p className="text-slate-600 leading-relaxed mb-6">
                        {hospital.name} is a state-of-the-art healthcare facility located in {hospital.city}. 
                        Established in {hospital.established_year || '2000'}, we have been serving patients with 
                        world-class medical care and compassion. Our hospital is equipped with cutting-edge 
                        technology and staffed by highly qualified medical professionals.
                      </p>

                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                            <Bed className="w-6 h-6 text-teal-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">{hospital.total_beds || '500'}+</p>
                            <p className="text-sm text-slate-500">Hospital Beds</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Stethoscope className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">{doctors.length || '100'}+</p>
                            <p className="text-sm text-slate-500">Expert Doctors</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Award className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">30+</p>
                            <p className="text-sm text-slate-500">Specialities</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                          <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-slate-800">1M+</p>
                            <p className="text-sm text-slate-500">Patients Treated</p>
                          </div>
                        </div>
                      </div>

                      {/* Map */}
                      <h3 className="font-semibold text-slate-800 mb-3">Location</h3>
                      <div className="h-64 rounded-xl overflow-hidden">
                        <MapContainer center={mapCenter} zoom={15} style={{ height: '100%', width: '100%' }}>
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap contributors'
                          />
                          <Marker position={mapCenter}>
                            <Popup>{hospital.name}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="doctors">
                  <div className="space-y-4">
                    {doctors.length > 0 ? doctors.map(doctor => (
                      <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                              {doctor.image_url ? (
                                <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover rounded-xl" />
                              ) : (
                                <span className="text-2xl font-bold text-teal-600">
                                  {doctor.name?.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-slate-800">{doctor.name}</h3>
                              <p className="text-teal-600 font-medium">{doctor.specialization}</p>
                              <p className="text-sm text-slate-500 mt-1">{doctor.qualification}</p>
                              <div className="flex items-center gap-4 mt-3">
                                <span className="text-sm text-slate-600">
                                  {doctor.experience_years} years exp.
                                </span>
                                <span className="flex items-center gap-1 text-sm">
                                  <Star className="w-4 h-4 text-amber-500 fill-current" />
                                  {doctor.rating || '4.8'}
                                </span>
                                <span className="text-sm font-semibold text-slate-800">
                                  ₹{doctor.consultation_fee}
                                </span>
                              </div>
                            </div>
                            <Link to={`${createPageUrl('BookAppointment')}?doctorId=${doctor.id}`}>
                              <Button className="bg-teal-600 hover:bg-teal-700">
                                Book Appointment
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    )) : (
                      <Card>
                        <CardContent className="p-12 text-center">
                          <Stethoscope className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-slate-500">No doctors available at this hospital yet.</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="specialities">
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {(hospital.specialities || ['Cardiology', 'Oncology', 'Orthopedics', 'Neurology', 'Nephrology', 'Gastroenterology', 'Pulmonology', 'Dermatology', 'Ophthalmology', 'Pediatrics', 'Gynecology', 'Urology']).map(spec => (
                          <div key={spec} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-teal-600" />
                            <span className="text-slate-700">{spec}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="facilities">
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(hospital.facilities || ['24/7 Emergency', 'ICU', 'NICU', 'Operation Theatres', 'Blood Bank', 'Pharmacy', 'Pathology Lab', 'Radiology', 'MRI', 'CT Scan', 'Dialysis Unit', 'Cafeteria', 'Parking', 'Ambulance']).map(facility => (
                          <div key={facility} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-teal-600" />
                            <span className="text-slate-700">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Book Appointment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-sm mb-4">
                    Schedule your visit with our expert doctors today.
                  </p>
                  <Link to={`${createPageUrl('BookAppointment')}?hospitalId=${hospital.id}`}>
                    <Button className="w-full bg-teal-600 hover:bg-teal-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <a href={`tel:${hospital.phone || '1800-123-4567'}`} className="font-medium text-slate-800 hover:text-teal-600">
                        {hospital.phone || '1800-123-4567'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <a href={`mailto:${hospital.email || 'info@vitacare.com'}`} className="font-medium text-slate-800 hover:text-teal-600">
                        {hospital.email || 'info@vitacare.com'}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="font-medium text-slate-800">
                        {hospital.address || `${hospital.name}, ${hospital.city}, ${hospital.state}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Working Hours</p>
                      <p className="font-medium text-slate-800">24/7 Emergency</p>
                      <p className="text-sm text-slate-600">OPD: 8:00 AM - 8:00 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
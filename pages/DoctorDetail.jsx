import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Star, MapPin, Clock, Calendar, GraduationCap, 
  Award, Languages, Building2, CheckCircle, Phone, Video, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

export default function DoctorDetail() {
  const [searchParams] = useSearchParams();
  const doctorId = searchParams.get('id');

  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: async () => {
      const doctors = await base44.entities.Doctor.filter({ id: doctorId });
      return doctors[0];
    },
    enabled: !!doctorId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-48 w-full rounded-2xl mb-8" />
          <Skeleton className="h-10 w-1/2 mb-4" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Doctor not found</h2>
          <Link to={createPageUrl('Doctors')}>
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Doctors
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-700 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link to={createPageUrl('Doctors')} className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Doctors
          </Link>
        </div>
      </section>

      {/* Profile Card */}
      <section className="max-w-4xl mx-auto px-4 -mt-24 relative z-10 pb-12">
        <Card className="overflow-hidden shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Photo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center overflow-hidden">
                  {doctor.image_url ? (
                    <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-teal-600">
                      {doctor.name?.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Dr. {doctor.name}</h1>
                    <p className="text-teal-600 font-semibold text-lg">{doctor.specialization}</p>
                    <p className="text-slate-500">{doctor.qualification}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl">
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                    <span className="text-xl font-bold text-slate-800">{doctor.rating || '4.8'}</span>
                    <span className="text-slate-500 text-sm">({doctor.reviews_count || '120'} reviews)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-teal-600">{doctor.experience_years || '15'}+</p>
                    <p className="text-sm text-slate-500">Years Exp.</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-teal-600">5000+</p>
                    <p className="text-sm text-slate-500">Patients</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-teal-600">{doctor.reviews_count || '120'}+</p>
                    <p className="text-sm text-slate-500">Reviews</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-teal-600">₹{doctor.consultation_fee || '500'}</p>
                    <p className="text-sm text-slate-500">Per Visit</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link to={`${createPageUrl('BookAppointment')}?doctorId=${doctor.id}`}>
                    <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Appointment
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="border-teal-200 text-teal-600">
                    <Video className="w-5 h-5 mr-2" />
                    Video Consult
                  </Button>
                  <Button size="lg" variant="outline">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Chat
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                Education & Qualifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">{doctor.qualification || 'MBBS, MD'}</p>
                    <p className="text-sm text-slate-500">All India Institute of Medical Sciences</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">Fellowship in {doctor.specialization}</p>
                    <p className="text-sm text-slate-500">International Medical University</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                Hospital Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{doctor.hospital_name || 'VitaCare Hospital'}</p>
                  <p className="text-sm text-slate-500">Delhi, India</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Available Days</p>
                  <p className="text-sm text-slate-500">
                    {doctor.available_days?.join(', ') || 'Mon, Tue, Wed, Thu, Fri'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                About Dr. {doctor.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 leading-relaxed">
                {doctor.bio || `Dr. ${doctor.name} is a highly experienced ${doctor.specialization} specialist with over ${doctor.experience_years || '15'} years of experience in treating complex medical conditions. Known for a patient-centric approach and expertise in advanced treatment methodologies, Dr. ${doctor.name} has successfully treated thousands of patients and is recognized as one of the leading specialists in the field.`}
              </p>
              
              {doctor.languages?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <Languages className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">Languages Spoken</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map(lang => (
                      <Badge key={lang} variant="secondary">{lang}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
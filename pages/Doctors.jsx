import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Search, Stethoscope, Star, MapPin, Clock, Calendar, 
  Filter, ChevronDown, GraduationCap, Languages, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const specialities = [
  'All Specialities', 'Cardiology', 'Oncology', 'Orthopaedics', 'Neurology', 
  'Gastroenterology', 'Nephrology', 'Pulmonology', 'Dermatology', 
  'Ophthalmology', 'Pediatrics', 'Gynecology', 'Urology', 'ENT', 'Psychiatry'
];

export default function Doctors() {
  const [searchParams] = useSearchParams();
  const specialityParam = searchParams.get('speciality');
  const searchParam = searchParams.get('search');
  
  const [searchQuery, setSearchQuery] = useState(searchParam || '');
  const [selectedSpeciality, setSelectedSpeciality] = useState(specialityParam || 'All Specialities');
  const [sortBy, setSortBy] = useState('rating');

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => base44.entities.Doctor.list('-rating', 100)
  });

  const filteredDoctors = doctors
    .filter(doctor => {
      const matchesSearch = 
        doctor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpeciality = 
        selectedSpeciality === 'All Specialities' || 
        doctor.specialization === selectedSpeciality;
      return matchesSearch && matchesSpeciality;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'experience') return (b.experience_years || 0) - (a.experience_years || 0);
      if (sortBy === 'fee_low') return (a.consultation_fee || 0) - (b.consultation_fee || 0);
      if (sortBy === 'fee_high') return (b.consultation_fee || 0) - (a.consultation_fee || 0);
      return 0;
    });

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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find Your Doctor
            </h1>
            <p className="text-teal-100 text-lg max-w-2xl mx-auto mb-8">
              4000+ specialist doctors across 30+ specialities ready to care for you
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2 shadow-xl">
              <div className="flex flex-col md:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search by doctor name, speciality..."
                    className="pl-12 h-12 border-0 focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={selectedSpeciality} onValueChange={setSelectedSpeciality}>
                  <SelectTrigger className="w-full md:w-48 h-12 border-0 bg-slate-50">
                    <Stethoscope className="w-4 h-4 mr-2 text-slate-400" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {specialities.map(spec => (
                      <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button className="h-12 px-8 bg-teal-600 hover:bg-teal-700">
                  Search
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <p className="text-slate-600">
              Showing <span className="font-semibold text-slate-800">{filteredDoctors.length}</span> doctors
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top Rated</SelectItem>
                  <SelectItem value="experience">Experience</SelectItem>
                  <SelectItem value="fee_low">Fee: Low to High</SelectItem>
                  <SelectItem value="fee_high">Fee: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Speciality Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {specialities.slice(0, 10).map(spec => (
              <button
                key={spec}
                onClick={() => setSelectedSpeciality(spec)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedSpeciality === spec
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-teal-50 hover:text-teal-600 border border-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          {/* Doctors Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-20 h-20 rounded-xl" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor, index) => (
                <motion.div
                  key={doctor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex gap-4 mb-4">
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {doctor.image_url ? (
                            <img src={doctor.image_url} alt={doctor.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-bold text-teal-600">
                              {doctor.name?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 text-lg group-hover:text-teal-600 transition-colors truncate">
                            Dr. {doctor.name}
                          </h3>
                          <p className="text-teal-600 font-medium text-sm">{doctor.specialization}</p>
                          <p className="text-slate-500 text-sm truncate">{doctor.qualification}</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600">{doctor.experience_years || '10'}+ years experience</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span className="text-slate-600 truncate">{doctor.hospital_name || 'VitaCare Hospital'}</span>
                        </div>
                        {doctor.languages?.length > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <Languages className="w-4 h-4 text-slate-400" />
                            <span className="text-slate-600">{doctor.languages.slice(0, 3).join(', ')}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="font-semibold text-slate-800">{doctor.rating || '4.8'}</span>
                          </div>
                          <span className="text-sm text-slate-500">({doctor.reviews_count || '100'}+ reviews)</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Consultation</p>
                          <p className="font-bold text-teal-600">₹{doctor.consultation_fee || '500'}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Link to={`${createPageUrl('DoctorDetail')}?id=${doctor.id}`} className="flex-1">
                          <Button variant="outline" className="w-full border-teal-200 text-teal-600 hover:bg-teal-50">
                            View Profile
                          </Button>
                        </Link>
                        <Link to={`${createPageUrl('BookAppointment')}?doctorId=${doctor.id}`} className="flex-1">
                          <Button className="w-full bg-teal-600 hover:bg-teal-700">
                            Book Now
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filteredDoctors.length === 0 && (
            <div className="text-center py-16">
              <Stethoscope className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No doctors found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
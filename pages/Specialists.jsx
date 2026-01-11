import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Stethoscope, Search, Star, Clock, MapPin, Calendar, Phone, Video, Filter, Loader2, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import EmergencyBar from '../components/vetacare/EmergencyBar';
import Navbar from '../components/vetacare/Navbar';
import AIChatbot from '../components/vetacare/AIChatbot';

const specialties = [
  'All Specialties',
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'Neurologist',
  'Gynecologist',
  'Psychiatrist',
  'ENT Specialist',
  'Ophthalmologist'
];

const doctors = [
  { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiologist', experience: 15, rating: 4.9, reviews: 245, fee: 150, available: true, nextSlot: '10:00 AM', hospital: 'Metro Medical Center', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150' },
  { id: 2, name: 'Dr. Michael Chen', specialty: 'Dermatologist', experience: 12, rating: 4.8, reviews: 189, fee: 120, available: true, nextSlot: '11:30 AM', hospital: 'City General Hospital', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150' },
  { id: 3, name: 'Dr. Emily Davis', specialty: 'Pediatrician', experience: 10, rating: 4.9, reviews: 312, fee: 100, available: true, nextSlot: '2:00 PM', hospital: "Children's Hospital", image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150' },
  { id: 4, name: 'Dr. James Wilson', specialty: 'Orthopedic', experience: 20, rating: 4.7, reviews: 156, fee: 180, available: false, nextSlot: 'Tomorrow', hospital: 'Metro Medical Center', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150' },
  { id: 5, name: 'Dr. Lisa Thompson', specialty: 'Neurologist', experience: 18, rating: 4.8, reviews: 198, fee: 200, available: true, nextSlot: '3:30 PM', hospital: 'Neuro Institute', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150' },
  { id: 6, name: 'Dr. Robert Martinez', specialty: 'General Physician', experience: 8, rating: 4.6, reviews: 124, fee: 80, available: true, nextSlot: '9:00 AM', hospital: 'Community Health Clinic', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150' },
  { id: 7, name: 'Dr. Jennifer Lee', specialty: 'Gynecologist', experience: 14, rating: 4.9, reviews: 267, fee: 130, available: true, nextSlot: '4:00 PM', hospital: "Women's Health Center", image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150' },
  { id: 8, name: 'Dr. David Brown', specialty: 'Psychiatrist', experience: 16, rating: 4.7, reviews: 145, fee: 160, available: true, nextSlot: '1:00 PM', hospital: 'Mental Wellness Center', image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150' },
];

export default function Specialists() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');


  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('Specialists'));
        return;
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All Specialties' || d.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBook = (doctor) => {
    // Navigate to BookAppointment page with pre-selected doctor
    navigate(createPageUrl(`BookAppointment?doctorId=${doctor.id}&specialty=${encodeURIComponent(doctor.specialty)}`));
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Find Specialists</h1>
          <p className="text-gray-500">Book appointments with top doctors</p>
        </div>

        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search doctors by name or specialty..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Specialty Quick Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {specialties.slice(1, 8).map((specialty) => (
            <Button
              key={specialty}
              variant={selectedSpecialty === specialty ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpecialty(specialty)}
              className={`whitespace-nowrap ${selectedSpecialty === specialty ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
            >
              {specialty}
            </Button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={doctor.image} alt={doctor.name} />
                    <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                    <p className="text-sm text-emerald-600">{doctor.specialty}</p>
                    <p className="text-xs text-gray-500 mt-1">{doctor.experience} years experience</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{doctor.rating}</span>
                    <span className="text-gray-400">({doctor.reviews})</span>
                  </div>
                  <Badge variant="secondary">
                    ${doctor.fee}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.hospital}</span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {doctor.available ? (
                        <span className="text-emerald-600">Next: {doctor.nextSlot}</span>
                      ) : (
                        <span className="text-gray-500">{doctor.nextSlot}</span>
                      )}
                    </span>
                  </div>
                  {doctor.available && (
                    <Badge className="bg-emerald-100 text-emerald-700">Available</Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleBook(doctor)}
                  >
                    <Video className="w-4 h-4 mr-1" />
                    Video
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => handleBook(doctor)}
                    disabled={!doctor.available}
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <Stethoscope className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No doctors found matching your criteria</p>
          </div>
        )}
      </main>

      <AIChatbot />
    </div>
  );
}
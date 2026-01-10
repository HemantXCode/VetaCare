import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Building2, MapPin, Star, Phone, Clock, ChevronRight, 
  Search, Filter, Users, Bed, Award, Stethoscope
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

const regions = ['All Regions', 'North India', 'South India', 'East India', 'West India'];

export default function Hospitals() {
  const [searchParams] = useSearchParams();
  const cityParam = searchParams.get('city');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');

  const { data: hospitals = [], isLoading } = useQuery({
    queryKey: ['hospitals'],
    queryFn: () => base44.entities.Hospital.list('-rating', 50)
  });

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         hospital.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'All Regions' || hospital.region === selectedRegion;
    const matchesCity = !cityParam || hospital.city?.toLowerCase() === cityParam.toLowerCase();
    return matchesSearch && matchesRegion && matchesCity;
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
              Our Network of Hospitals
            </h1>
            <p className="text-teal-100 text-lg max-w-2xl mx-auto mb-8">
              50+ state-of-the-art hospitals across India providing world-class healthcare
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-2 shadow-xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Search by hospital name or city..."
                    className="pl-12 h-12 border-0 focus:ring-0"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="h-12 px-6 bg-teal-600 hover:bg-teal-700">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b sticky top-24 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Tabs value={selectedRegion} onValueChange={setSelectedRegion}>
            <TabsList className="bg-slate-100">
              {regions.map(region => (
                <TabsTrigger key={region} value={region} className="text-sm">
                  {region}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Hospitals Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <p className="text-slate-600">
              Showing <span className="font-semibold text-slate-800">{filteredHospitals.length}</span> hospitals
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHospitals.map((hospital, index) => (
                <motion.div
                  key={hospital.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`${createPageUrl('HospitalDetail')}?id=${hospital.id}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={hospital.image_url || `https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&q=80`}
                          alt={hospital.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          <span className="font-semibold text-slate-800">{hospital.rating || '4.5'}</span>
                        </div>
                        {hospital.accreditations?.length > 0 && (
                          <div className="absolute bottom-4 left-4 flex gap-2">
                            {hospital.accreditations.slice(0, 2).map(acc => (
                              <Badge key={acc} className="bg-teal-600 text-white text-xs">
                                {acc}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-teal-600 transition-colors">
                          {hospital.name}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-500 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{hospital.city}, {hospital.state}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <Bed className="w-4 h-4 text-teal-600" />
                            <span className="text-sm text-slate-600">{hospital.total_beds || '500'}+ Beds</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-teal-600" />
                            <span className="text-sm text-slate-600">30+ Specialities</span>
                          </div>
                        </div>

                        <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700">
                          View Hospital
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {!isLoading && filteredHospitals.length === 0 && (
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No hospitals found</h3>
              <p className="text-slate-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
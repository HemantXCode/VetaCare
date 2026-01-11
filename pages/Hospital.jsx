import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Building2, MapPin, Phone, Clock, Star, Navigation, Search, Filter, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmergencyBar from '../components/vetacare/EmergencyBar';
import Navbar from '../components/vetacare/Navbar';
import AIChatbot from '../components/vetacare/AIChatbot';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Hospital icon
const hospitalIcon = new L.DivIcon({
  className: 'custom-hospital-icon',
  html: `<div style="background: #3b82f6; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
    </svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// User location icon
const userIcon = new L.DivIcon({
  className: 'custom-user-icon',
  html: `<div style="background: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Sample hospitals data
const sampleHospitals = [
  { id: 1, name: 'City General Hospital', type: 'general', rating: 4.5, emergency: true, distance: 1.2, phone: '(555) 123-4567', hours: '24/7', specialties: ['Emergency', 'Surgery', 'Pediatrics'] },
  { id: 2, name: 'Metro Medical Center', type: 'multispecialty', rating: 4.8, emergency: true, distance: 2.5, phone: '(555) 234-5678', hours: '24/7', specialties: ['Cardiology', 'Neurology', 'Oncology'] },
  { id: 3, name: 'Community Health Clinic', type: 'clinic', rating: 4.2, emergency: false, distance: 0.8, phone: '(555) 345-6789', hours: '8 AM - 8 PM', specialties: ['General Medicine', 'Vaccination'] },
  { id: 4, name: "Children's Hospital", type: 'specialty', rating: 4.9, emergency: true, distance: 3.1, phone: '(555) 456-7890', hours: '24/7', specialties: ['Pediatrics', 'Neonatology'] },
  { id: 5, name: 'Heart & Vascular Institute', type: 'specialty', rating: 4.7, emergency: true, distance: 4.2, phone: '(555) 567-8901', hours: '24/7', specialties: ['Cardiology', 'Cardiac Surgery'] },
  { id: 6, name: 'Wellness Medical Center', type: 'general', rating: 4.3, emergency: false, distance: 1.8, phone: '(555) 678-9012', hours: '7 AM - 10 PM', specialties: ['Family Medicine', 'Preventive Care'] },
];

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function Hospitals() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('Hospitals'));
        return;
      }
      getLocation();
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(loc);
          generateHospitals(loc);
        },
        () => {
          const defaultLoc = { lat: 40.7128, lng: -74.006 };
          setUserLocation(defaultLoc);
          generateHospitals(defaultLoc);
        }
      );
    }
  };

  const generateHospitals = (loc) => {
    const hospitalsWithLocations = sampleHospitals.map((hospital, index) => ({
      ...hospital,
      lat: loc.lat + (Math.random() - 0.5) * 0.05,
      lng: loc.lng + (Math.random() - 0.5) * 0.05
    }));
    setHospitals(hospitalsWithLocations);
  };

  const filteredHospitals = hospitals.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          h.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || h.type === filterType;
    const matchesEmergency = !showEmergencyOnly || h.emergency;
    return matchesSearch && matchesType && matchesEmergency;
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Nearby Hospitals</h1>
          <p className="text-gray-500">Find hospitals and healthcare facilities near you</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search hospitals or specialties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General Hospital</SelectItem>
                  <SelectItem value="multispecialty">Multispecialty</SelectItem>
                  <SelectItem value="specialty">Specialty</SelectItem>
                  <SelectItem value="clinic">Clinic</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showEmergencyOnly ? "default" : "outline"}
                onClick={() => setShowEmergencyOnly(!showEmergencyOnly)}
                className={showEmergencyOnly ? "bg-red-600 hover:bg-red-700" : ""}
              >
                <Filter className="w-4 h-4 mr-2" />
                Emergency Only
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden h-[500px]">
              {userLocation && (
                <MapContainer
                  center={[userLocation.lat, userLocation.lng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController center={selectedHospital ? [selectedHospital.lat, selectedHospital.lng] : [userLocation.lat, userLocation.lng]} />
                  
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup>Your Location</Popup>
                  </Marker>

                  {filteredHospitals.map((hospital) => (
                    <Marker
                      key={hospital.id}
                      position={[hospital.lat, hospital.lng]}
                      icon={hospitalIcon}
                      eventHandlers={{
                        click: () => setSelectedHospital(hospital)
                      }}
                    >
                      <Popup>
                        <div className="p-1">
                          <h3 className="font-semibold">{hospital.name}</h3>
                          <p className="text-sm text-gray-500">{hospital.distance} km away</p>
                          {hospital.emergency && (
                            <Badge className="bg-red-100 text-red-700 mt-1">24/7 Emergency</Badge>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </Card>
          </div>

          {/* Hospital List */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {filteredHospitals.map((hospital) => (
              <Card 
                key={hospital.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedHospital?.id === hospital.id ? 'ring-2 ring-emerald-500' : ''
                }`}
                onClick={() => setSelectedHospital(hospital)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{hospital.rating}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{hospital.distance} km</span>
                      </div>
                    </div>
                    {hospital.emergency && (
                      <Badge className="bg-red-100 text-red-700">Emergency</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {hospital.specialties.slice(0, 3).map((specialty, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {hospital.hours}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {hospital.phone}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <a href={`tel:${hospital.phone}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                    </a>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}`, '_blank');
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Ambulance, MapPin, Phone, Loader2, AlertCircle, Clock, Building2, Navigation, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EmergencyBar from '../components/vetacare/EmergencyBar';
import Navbar from '../components/vetacare/Navbar';
import AIChatbot from '../components/vetacare/AIChatbot';
import { motion, AnimatePresence } from 'framer-motion';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom ambulance icon
const ambulanceIcon = new L.DivIcon({
  className: 'custom-ambulance-icon',
  html: `<div style="background: #dc2626; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
      <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
      <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0"/>
      <path d="M5 17h-2v-11a1 1 0 0 1 1 -1h9v12m-4 0h6m4 0h2v-6h-8m0 -5h5l3 5"/>
      <path d="M6 10h4m-2 -2v4"/>
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Custom user location icon
const userIcon = new L.DivIcon({
  className: 'custom-user-icon',
  html: `<div style="background: #10b981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Hospital icon
const hospitalIcon = new L.DivIcon({
  className: 'custom-hospital-icon',
  html: `<div style="background: #3b82f6; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
      <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
    </svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

// Component to animate ambulance
function AnimatedAmbulance({ userLocation, ambulancePosition }) {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14);
    }
  }, [userLocation, map]);

  return (
    <>
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <strong>Your Location</strong>
              <p className="text-sm text-gray-500">Help is on the way!</p>
            </div>
          </Popup>
        </Marker>
      )}
      {ambulancePosition && (
        <Marker position={[ambulancePosition.lat, ambulancePosition.lng]} icon={ambulanceIcon}>
          <Popup>
            <div className="text-center">
              <strong>🚑 Ambulance</strong>
              <p className="text-sm text-gray-500">En route to your location</p>
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

// Sample nearby hospitals
const nearbyHospitals = [
  { id: 1, name: 'City General Hospital', lat: 0, lng: 0, distance: '1.2 km', time: '5 min' },
  { id: 2, name: 'Metro Medical Center', lat: 0, lng: 0, distance: '2.5 km', time: '8 min' },
  { id: 3, name: 'Community Health Center', lat: 0, lng: 0, distance: '3.1 km', time: '12 min' },
];

export default function Emergency() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [ambulancePosition, setAmbulancePosition] = useState(null);
  const [emergencyRequest, setEmergencyRequest] = useState(null);
  const [emergencyType, setEmergencyType] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const animationRef = useRef(null);

  useEffect(() => {
    checkAuth();
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) {
        base44.auth.redirectToLogin(createPageUrl('Emergency'));
        return;
      }

      const user = await base44.auth.me();
      const patients = await base44.entities.Patient.filter({ user_id: user.email });
      
      if (patients.length === 0) {
        navigate(createPageUrl('Onboarding'));
        return;
      }

      setPatient(patients[0]);
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
          
          // Generate nearby hospitals relative to user location
          setHospitals([
            { ...nearbyHospitals[0], lat: loc.lat + 0.008, lng: loc.lng + 0.005 },
            { ...nearbyHospitals[1], lat: loc.lat - 0.01, lng: loc.lng + 0.012 },
            { ...nearbyHospitals[2], lat: loc.lat + 0.015, lng: loc.lng - 0.008 },
          ]);
        },
        (error) => {
          console.error('Location error:', error);
          // Default location (New York)
          const defaultLoc = { lat: 40.7128, lng: -74.006 };
          setUserLocation(defaultLoc);
          setHospitals([
            { ...nearbyHospitals[0], lat: defaultLoc.lat + 0.008, lng: defaultLoc.lng + 0.005 },
            { ...nearbyHospitals[1], lat: defaultLoc.lat - 0.01, lng: defaultLoc.lng + 0.012 },
            { ...nearbyHospitals[2], lat: defaultLoc.lat + 0.015, lng: defaultLoc.lng - 0.008 },
          ]);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  const requestAmbulance = async () => {
    if (!userLocation) {
      alert('Please enable location services');
      return;
    }

    setRequesting(true);
    try {
      const request = await base44.entities.EmergencyRequest.create({
        patient_id: patient?.id,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        emergency_type: emergencyType || 'other',
        status: 'requested',
        estimated_arrival: Math.floor(Math.random() * 10) + 5
      });

      setEmergencyRequest(request);

      // Start ambulance from a hospital
      const startPos = {
        lat: userLocation.lat + 0.02,
        lng: userLocation.lng + 0.015
      };
      setAmbulancePosition(startPos);

      // Animate ambulance towards user
      let progress = 0;
      animationRef.current = setInterval(() => {
        progress += 0.02;
        if (progress >= 1) {
          clearInterval(animationRef.current);
          setEmergencyRequest(prev => ({ ...prev, status: 'arrived' }));
          return;
        }

        setAmbulancePosition({
          lat: startPos.lat + (userLocation.lat - startPos.lat) * progress,
          lng: startPos.lng + (userLocation.lng - startPos.lng) * progress
        });

        // Update status based on progress
        if (progress > 0.1 && progress < 0.3) {
          setEmergencyRequest(prev => prev?.status !== 'dispatched' ? { ...prev, status: 'dispatched' } : prev);
        } else if (progress >= 0.3) {
          setEmergencyRequest(prev => prev?.status !== 'en_route' ? { ...prev, status: 'en_route' } : prev);
        }
      }, 200);

    } catch (error) {
      console.error('Emergency request error:', error);
    } finally {
      setRequesting(false);
    }
  };

  const cancelRequest = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    setEmergencyRequest(null);
    setAmbulancePosition(null);
  };

  const statusConfig = {
    requested: { label: 'Finding Ambulance', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    dispatched: { label: 'Ambulance Dispatched', color: 'bg-blue-100 text-blue-700', icon: Ambulance },
    en_route: { label: 'En Route to You', color: 'bg-emerald-100 text-emerald-700', icon: Navigation },
    arrived: { label: 'Ambulance Arrived', color: 'bg-green-100 text-green-700', icon: CheckCircle2 }
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden h-[500px]">
              <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white py-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <CardTitle className="text-lg">Emergency Map</CardTitle>
                </div>
              </CardHeader>
              <div className="h-[calc(100%-60px)]">
                {userLocation && (
                  <MapContainer
                    center={[userLocation.lat, userLocation.lng]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <AnimatedAmbulance 
                      userLocation={userLocation}
                      ambulancePosition={ambulancePosition}
                    />
                    {hospitals.map((hospital) => (
                      <Marker 
                        key={hospital.id}
                        position={[hospital.lat, hospital.lng]}
                        icon={hospitalIcon}
                      >
                        <Popup>
                          <div>
                            <strong>{hospital.name}</strong>
                            <p className="text-sm text-gray-500">{hospital.distance} away</p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </div>
            </Card>

            {/* Nearby Hospitals */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Nearby Hospitals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hospitals.map((hospital) => (
                    <div 
                      key={hospital.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{hospital.name}</p>
                          <p className="text-sm text-gray-500">{hospital.distance} • {hospital.time}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Navigation className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Emergency Request Panel */}
          <div>
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <Ambulance className="w-5 h-5" />
                  Emergency Ambulance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <AnimatePresence mode="wait">
                  {!emergencyRequest ? (
                    <motion.div
                      key="request-form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Emergency Type
                        </label>
                        <Select value={emergencyType} onValueChange={setEmergencyType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cardiac">Cardiac Emergency</SelectItem>
                            <SelectItem value="accident">Accident / Trauma</SelectItem>
                            <SelectItem value="breathing">Breathing Difficulty</SelectItem>
                            <SelectItem value="stroke">Stroke Symptoms</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm text-gray-600">Your Location</span>
                          {userLocation && (
                            <Badge className="bg-emerald-100 text-emerald-700 ml-auto">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Located
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        onClick={requestAmbulance}
                        disabled={requesting || !userLocation}
                        className="w-full h-14 bg-red-600 hover:bg-red-700 text-lg"
                      >
                        {requesting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Phone className="w-5 h-5 mr-2" />
                            Call Ambulance
                          </>
                        )}
                      </Button>

                      <a 
                        href="tel:108"
                        className="block text-center text-red-600 text-sm hover:underline"
                      >
                        Or call 108 directly
                      </a>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="request-status"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      {/* Status Card */}
                      <div className="bg-white border-2 border-red-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-gray-500">Status</span>
                          <Badge className={statusConfig[emergencyRequest.status]?.color}>
                            {statusConfig[emergencyRequest.status]?.label}
                          </Badge>
                        </div>

                        {/* Visual Progress */}
                        <div className="flex items-center justify-between mb-4">
                          {['requested', 'dispatched', 'en_route', 'arrived'].map((status, idx) => {
                            const isActive = ['requested', 'dispatched', 'en_route', 'arrived'].indexOf(emergencyRequest.status) >= idx;
                            const Icon = statusConfig[status]?.icon || Clock;
                            return (
                              <React.Fragment key={status}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                  isActive ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                {idx < 3 && (
                                  <div className={`flex-1 h-1 mx-1 rounded ${
                                    ['requested', 'dispatched', 'en_route', 'arrived'].indexOf(emergencyRequest.status) > idx
                                      ? 'bg-red-600'
                                      : 'bg-gray-200'
                                  }`} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* ETA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Estimated Arrival</span>
                          </div>
                          <span className="font-bold text-red-600">
                            {emergencyRequest.status === 'arrived' ? 'Arrived!' : `${emergencyRequest.estimated_arrival} min`}
                          </span>
                        </div>
                      </div>

                      {emergencyRequest.status !== 'arrived' && (
                        <Button
                          variant="outline"
                          onClick={cancelRequest}
                          className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Cancel Request
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Only use for genuine emergencies. Misuse is a punishable offense.
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Emergency Contacts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <a href="tel:108" className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Ambulance className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-red-900">Ambulance</p>
                      <p className="text-sm text-red-600">108</p>
                    </div>
                  </div>
                  <Phone className="w-5 h-5 text-red-600" />
                </a>
                <a href="tel:100" className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">Police</p>
                      <p className="text-sm text-blue-600">100</p>
                    </div>
                  </div>
                  <Phone className="w-5 h-5 text-blue-600" />
                </a>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AIChatbot />
    </div>
  );
}
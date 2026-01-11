import React, { useState } from 'react';
import { Ambulance, MapPin, Phone, Loader2, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EmergencyCard({ patientId }) {
  const [emergencyType, setEmergencyType] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [emergencyRequest, setEmergencyRequest] = useState(null);

  const getLocation = async () => {
    setLocationLoading(true);
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(loc);
          setLocationLoading(false);
          resolve(loc);
        },
        (error) => {
          setLocationLoading(false);
          reject(error);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  const requestAmbulance = async () => {
    setLoading(true);
    try {
      let loc = location;
      if (!loc) {
        loc = await getLocation();
      }

      const request = await base44.entities.EmergencyRequest.create({
        patient_id: patientId,
        latitude: loc.latitude,
        longitude: loc.longitude,
        emergency_type: emergencyType || 'other',
        status: 'requested',
        estimated_arrival: Math.floor(Math.random() * 10) + 5 // 5-15 minutes
      });

      setEmergencyRequest(request);

      // Simulate status updates
      setTimeout(() => {
        setEmergencyRequest(prev => ({ ...prev, status: 'dispatched' }));
      }, 2000);

      setTimeout(() => {
        setEmergencyRequest(prev => ({ ...prev, status: 'en_route' }));
      }, 4000);

    } catch (error) {
      console.error('Emergency request error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    requested: { label: 'Requested', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    dispatched: { label: 'Dispatched', color: 'bg-blue-100 text-blue-700', icon: Ambulance },
    en_route: { label: 'En Route', color: 'bg-emerald-100 text-emerald-700', icon: Ambulance },
    arrived: { label: 'Arrived', color: 'bg-green-100 text-green-700', icon: CheckCircle2 }
  };

  return (
    <Card className="border-red-200 bg-red-50/30">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Ambulance className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <CardTitle className="text-lg text-red-900">Emergency Ambulance</CardTitle>
            <p className="text-sm text-red-600">Request immediate medical assistance</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!emergencyRequest ? (
          <>
            {/* Emergency Type Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Type of Emergency (Optional)
              </label>
              <Select value={emergencyType} onValueChange={setEmergencyType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiac">Cardiac Emergency</SelectItem>
                  <SelectItem value="accident">Accident / Trauma</SelectItem>
                  <SelectItem value="breathing">Breathing Difficulty</SelectItem>
                  <SelectItem value="stroke">Stroke Symptoms</SelectItem>
                  <SelectItem value="other">Other Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location Status */}
            <div className="bg-white rounded-lg p-3 border border-red-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-gray-600">Your Location</span>
                </div>
                {location ? (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Located
                  </Badge>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={getLocation}
                    disabled={locationLoading}
                  >
                    {locationLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Get Location'
                    )}
                  </Button>
                )}
              </div>
              {location && (
                <p className="text-xs text-gray-500 mt-2">
                  {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              )}
            </div>

            {/* Call Ambulance Button */}
            <Button 
              onClick={requestAmbulance}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Call Ambulance
                </>
              )}
            </Button>

            {/* Direct Call */}
            <a 
              href="tel:108" 
              className="block text-center text-red-600 text-sm hover:underline"
            >
              Or call 108 directly
            </a>
          </>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Status */}
              <div className="bg-white rounded-xl p-4 border border-red-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge className={statusConfig[emergencyRequest.status]?.color}>
                    {statusConfig[emergencyRequest.status]?.label}
                  </Badge>
                </div>

                {/* Animated Ambulance */}
                <div className="relative h-16 bg-red-50 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ 
                      x: emergencyRequest.status === 'en_route' ? '200%' : 
                         emergencyRequest.status === 'dispatched' ? '0%' : '-50%'
                    }}
                    transition={{ duration: 2, ease: 'easeInOut' }}
                    className="absolute top-1/2 -translate-y-1/2"
                  >
                    <Ambulance className="w-10 h-10 text-red-600" />
                  </motion.div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>

                {/* ETA */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-red-100">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Estimated Arrival</span>
                  </div>
                  <span className="font-bold text-red-600">
                    {emergencyRequest.estimated_arrival} minutes
                  </span>
                </div>
              </div>

              {/* View on Map */}
              <Link to={createPageUrl(`Emergency?request=${emergencyRequest.id}`)}>
                <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                  <MapPin className="w-4 h-4 mr-2" />
                  View on Map
                </Button>
              </Link>

              {/* Cancel */}
              <Button 
                variant="ghost" 
                className="w-full text-gray-500"
                onClick={() => setEmergencyRequest(null)}
              >
                Cancel Request
              </Button>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Warning */}
        <div className="flex items-start gap-2 text-xs text-red-600 bg-red-100 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Only use for genuine emergencies. Misuse of emergency services is a punishable offense.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
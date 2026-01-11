import React from 'react';
import { Phone, MapPin, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EmergencyBar() {
  return (
    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium">24/7 Emergency Services</span>
          </div>
          <a 
            href="tel:108" 
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-all"
          >
            <Phone className="w-4 h-4" />
            <span className="font-bold">108</span>
          </a>
        </div>
        <Link 
          to={createPageUrl('Emergency')}
          className="flex items-center gap-2 bg-white text-red-600 hover:bg-red-50 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
        >
          <MapPin className="w-4 h-4" />
          Find Nearby Hospitals
        </Link>
      </div>
    </div>
  );
}
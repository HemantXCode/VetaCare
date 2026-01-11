import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Menu, X, User, Heart, Building2, Stethoscope, Leaf, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Calendar, Target } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', page: 'Dashboard', icon: LayoutDashboard },
  { name: 'Appointments', page: 'BookAppointment', icon: Calendar },
  { name: 'Specialists', page: 'Specialists', icon: Stethoscope },
  { name: 'Hospitals', page: 'Hospitals', icon: Building2 },
  { name: 'My Health', page: 'PatientCorner', icon: User },
  { name: 'Wellness', page: 'Wellness', icon: Leaf },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">VetaCare</span>
              <span className="text-xs text-emerald-600 font-medium ml-1">2.0</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes(item.page);
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Mobile Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.includes(item.page);
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.page)}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
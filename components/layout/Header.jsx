import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Search, MapPin, Phone, ChevronDown, Menu, X, 
  Calendar, Building2, Stethoscope, Heart, Users, 
  Globe, ClipboardList, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const regions = {
  'North India': ['Delhi', 'Noida', 'Gurgaon', 'Jaipur', 'Chandigarh', 'Lucknow'],
  'South India': ['Bangalore', 'Chennai', 'Hyderabad', 'Kochi', 'Coimbatore'],
  'East India': ['Kolkata', 'Patna', 'Bhubaneswar', 'Guwahati'],
  'West India': ['Mumbai', 'Pune', 'Ahmedabad', 'Surat', 'Nagpur']
};

const specialities = [
  { name: 'Cardiology', icon: '❤️', desc: 'Heart & Cardiovascular Care' },
  { name: 'Oncology', icon: '🎗️', desc: 'Cancer Treatment' },
  { name: 'Orthopaedics', icon: '🦴', desc: 'Bone & Joint Care' },
  { name: 'Neurology', icon: '🧠', desc: 'Brain & Nerve Treatment' },
  { name: 'Gastroenterology', icon: '🫁', desc: 'Digestive System Care' },
  { name: 'Nephrology', icon: '🫘', desc: 'Kidney Care' },
  { name: 'Pulmonology', icon: '🫁', desc: 'Lung & Respiratory Care' },
  { name: 'Dermatology', icon: '🩹', desc: 'Skin Care' },
  { name: 'Ophthalmology', icon: '👁️', desc: 'Eye Care' },
  { name: 'Pediatrics', icon: '👶', desc: 'Child Healthcare' },
  { name: 'Gynecology', icon: '🩺', desc: 'Women\'s Health' },
  { name: 'Urology', icon: '🔬', desc: 'Urinary System Care' }
];

const centresOfExcellence = [
  'Heart Institute', 'Cancer Centre', 'Bone & Joint Institute',
  'Brain & Spine Centre', 'Kidney & Urology Institute', 'Mother & Child Care'
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Delhi');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-md'
    }`}>
      {/* Top Bar */}
      <div className="bg-teal-700 text-white py-2 px-4 text-sm hidden md:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a href="tel:+911234567890" className="flex items-center gap-2 hover:text-teal-200 transition-colors">
              <Phone className="w-4 h-4" />
              <span>Emergency: 1800-123-4567</span>
            </a>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>24/7 Available</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('International')} className="hover:text-teal-200 transition-colors flex items-center gap-1">
              <Globe className="w-4 h-4" />
              International Patients
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 hover:text-teal-200 transition-colors">
                <MapPin className="w-4 h-4" />
                {selectedCity}
                <ChevronDown className="w-3 h-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-64 overflow-y-auto">
                {Object.values(regions).flat().map(city => (
                  <DropdownMenuItem key={city} onClick={() => setSelectedCity(city)}>
                    {city}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to={createPageUrl('Home')} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-teal-700">Vita</span>
              <span className="text-2xl font-bold text-slate-700">Care</span>
              <p className="text-[10px] text-slate-500 -mt-1 hidden md:block">Healthcare for Good</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <Link to={createPageUrl('Doctors')} className="px-3 py-2 text-slate-700 hover:text-teal-600 font-medium text-sm transition-colors">
                    Find a Doctor
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-slate-700 hover:text-teal-600 font-medium text-sm">
                    Hospitals
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[600px] p-6 bg-white">
                      <h3 className="font-semibold text-teal-700 mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Our Hospitals by Region
                      </h3>
                      <div className="grid grid-cols-2 gap-6">
                        {Object.entries(regions).map(([region, cities]) => (
                          <div key={region}>
                            <h4 className="font-medium text-slate-800 mb-2">{region}</h4>
                            <ul className="space-y-1">
                              {cities.slice(0, 4).map(city => (
                                <li key={city}>
                                  <Link 
                                    to={`${createPageUrl('Hospitals')}?city=${city}`}
                                    className="text-sm text-slate-600 hover:text-teal-600 transition-colors"
                                  >
                                    VitaCare {city}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      <Link 
                        to={createPageUrl('Hospitals')}
                        className="inline-block mt-4 text-teal-600 font-medium text-sm hover:underline"
                      >
                        View All Hospitals →
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-slate-700 hover:text-teal-600 font-medium text-sm">
                    Specialities
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[700px] p-6 bg-white">
                      <h3 className="font-semibold text-teal-700 mb-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5" />
                        Medical Specialities
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {specialities.map(spec => (
                          <Link 
                            key={spec.name}
                            to={`${createPageUrl('Doctors')}?speciality=${spec.name}`}
                            className="p-3 rounded-lg hover:bg-teal-50 transition-colors group"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{spec.icon}</span>
                              <div>
                                <p className="font-medium text-slate-800 group-hover:text-teal-700 text-sm">{spec.name}</p>
                                <p className="text-xs text-slate-500">{spec.desc}</p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-slate-700 hover:text-teal-600 font-medium text-sm">
                    Centres of Excellence
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[400px] p-6 bg-white">
                      <h3 className="font-semibold text-teal-700 mb-4">Centres of Excellence</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {centresOfExcellence.map(centre => (
                          <Link 
                            key={centre}
                            to={createPageUrl('Doctors')}
                            className="p-3 rounded-lg hover:bg-teal-50 text-sm text-slate-700 hover:text-teal-700 transition-colors"
                          >
                            {centre}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to={createPageUrl('Wellness')} className="px-3 py-2 text-slate-700 hover:text-teal-600 font-medium text-sm transition-colors">
                    Wellness
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to={createPageUrl('Dashboard')} className="px-3 py-2 text-slate-700 hover:text-teal-600 font-medium text-sm transition-colors">
                    Patient Corner
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to={createPageUrl('Wellness')}>
              <Button variant="outline" size="sm" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                <ClipboardList className="w-4 h-4 mr-2" />
                Health Checkup
              </Button>
            </Link>
            <Link to={createPageUrl('BookAppointment')}>
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                <Calendar className="w-4 h-4 mr-2" />
                Book Appointment
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t shadow-lg max-h-[80vh] overflow-y-auto">
          <nav className="p-4 space-y-2">
            <Link to={createPageUrl('Doctors')} className="block px-4 py-3 rounded-lg hover:bg-teal-50 text-slate-700 font-medium">
              Find a Doctor
            </Link>
            <Link to={createPageUrl('Hospitals')} className="block px-4 py-3 rounded-lg hover:bg-teal-50 text-slate-700 font-medium">
              Hospitals
            </Link>
            <Link to={createPageUrl('Doctors')} className="block px-4 py-3 rounded-lg hover:bg-teal-50 text-slate-700 font-medium">
              Specialities
            </Link>
            <Link to={createPageUrl('Wellness')} className="block px-4 py-3 rounded-lg hover:bg-teal-50 text-slate-700 font-medium">
              Wellness
            </Link>
            <Link to={createPageUrl('Dashboard')} className="block px-4 py-3 rounded-lg hover:bg-teal-50 text-slate-700 font-medium">
              Patient Corner
            </Link>
            <div className="pt-4 space-y-2">
              <Link to={createPageUrl('BookAppointment')} className="block">
                <Button className="w-full bg-teal-600 hover:bg-teal-700">
                  Book Appointment
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
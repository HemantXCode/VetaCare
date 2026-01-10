import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Search, Calendar, Building2, Stethoscope, FileHeart, Shield, 
  Star, Users, Award, Heart, ArrowRight, ChevronRight,
  Phone, Clock, CheckCircle, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';

const quickActions = [
  { 
    icon: Calendar, 
    title: 'Book Appointment', 
    desc: 'Schedule your visit', 
    color: 'from-teal-500 to-teal-600',
    url: 'BookAppointment'
  },
  { 
    icon: Building2, 
    title: 'Hospitals', 
    desc: 'Find nearby hospitals', 
    color: 'from-blue-500 to-blue-600',
    url: 'Hospitals'
  },
  { 
    icon: Stethoscope, 
    title: 'Doctors', 
    desc: 'Consult specialists', 
    color: 'from-purple-500 to-purple-600',
    url: 'Doctors'
  },
  { 
    icon: FileHeart, 
    title: 'Health Packages', 
    desc: 'Preventive checkups', 
    color: 'from-rose-500 to-rose-600',
    url: 'Wellness'
  },
  { 
    icon: Shield, 
    title: 'AI Diagnosis', 
    desc: 'Symptom checker', 
    color: 'from-amber-500 to-amber-600',
    url: 'ScanDisease'
  }
];

const specialities = [
  { name: 'Cardiology', icon: '❤️', doctors: 45 },
  { name: 'Oncology', icon: '🎗️', doctors: 32 },
  { name: 'Orthopaedics', icon: '🦴', doctors: 38 },
  { name: 'Neurology', icon: '🧠', doctors: 28 },
  { name: 'Gastroenterology', icon: '🫁', doctors: 24 },
  { name: 'Nephrology', icon: '🫘', doctors: 18 },
  { name: 'Pediatrics', icon: '👶', doctors: 35 },
  { name: 'Dermatology', icon: '🩹', doctors: 22 }
];

const stats = [
  { value: '50+', label: 'Hospitals', icon: Building2 },
  { value: '4000+', label: 'Doctors', icon: Stethoscope },
  { value: '1M+', label: 'Patients Served', icon: Users },
  { value: '25+', label: 'Years of Excellence', icon: Award }
];

const testimonials = [
  {
    name: 'Rajesh Kumar',
    location: 'Delhi',
    rating: 5,
    text: 'The cardiac surgery at VitaCare saved my life. The doctors and staff were incredibly supportive throughout my recovery journey.',
    treatment: 'Cardiac Surgery'
  },
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'Best healthcare experience! The online appointment system made everything so convenient. Highly recommend VitaCare.',
    treatment: 'Orthopedic Care'
  },
  {
    name: 'Mohammed Ali',
    location: 'Bangalore',
    rating: 5,
    text: 'The oncology team at VitaCare provided exceptional care during my treatment. Forever grateful for their expertise.',
    treatment: 'Cancer Treatment'
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await base44.auth.isAuthenticated();
      setIsAuthenticated(auth);
    };
    checkAuth();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-teal-50/30 to-white min-h-[90vh] flex items-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                Trusted by 1 Million+ Patients
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Healthcare for{' '}
                <span className="text-teal-600">Good.</span>
                <br />
                Today. Tomorrow.{' '}
                <span className="text-teal-600">Always.</span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Experience world-class healthcare with VitaCare's network of 50+ hospitals, 
                4000+ specialist doctors, and cutting-edge medical technology across India.
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-3 mb-8">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      placeholder="Search doctors, specialities, or hospitals..."
                      className="pl-12 h-14 border-0 text-base focus:ring-0"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Link to={`${createPageUrl('Doctors')}?search=${searchQuery}`}>
                    <Button className="h-14 px-8 bg-teal-600 hover:bg-teal-700 text-base">
                      Search
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link to={createPageUrl('BookAppointment')}>
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700 h-14 px-8 text-base">
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Appointment
                  </Button>
                </Link>
                <a href="tel:1800-123-4567" className="flex items-center gap-3 text-slate-600 hover:text-teal-600 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">24/7 Emergency</p>
                    <p className="font-semibold">1800-123-4567</p>
                  </div>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <img 
                src="https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80"
                alt="VitaCare Hospital"
                className="rounded-3xl shadow-2xl shadow-slate-300/50 w-full object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">NABH & JCI Accredited</p>
                  <p className="text-sm text-slate-500">International Quality Standards</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-teal-600 text-white rounded-2xl shadow-xl p-4">
                <p className="text-3xl font-bold">4.8</p>
                <div className="flex gap-0.5 my-1">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-xs text-teal-100">Patient Rating</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={createPageUrl(action.url)}>
                  <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-0 shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center transform group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-800 mb-1">{action.title}</h3>
                      <p className="text-sm text-slate-500">{action.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center text-white"
              >
                <stat.icon className="w-10 h-10 mx-auto mb-3 opacity-80" />
                <p className="text-4xl md:text-5xl font-bold mb-1">{stat.value}</p>
                <p className="text-teal-100">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialities */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Our Medical Specialities
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Comprehensive healthcare services across 30+ specialities with world-renowned doctors
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {specialities.map((spec, index) => (
              <motion.div
                key={spec.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`${createPageUrl('Doctors')}?speciality=${spec.name}`}>
                  <Card className="group hover:shadow-lg hover:border-teal-200 transition-all cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{spec.icon}</span>
                        <div>
                          <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                            {spec.name}
                          </h3>
                          <p className="text-sm text-slate-500">{spec.doctors} Doctors</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to={createPageUrl('Doctors')}>
              <Button variant="outline" size="lg" className="border-teal-600 text-teal-600 hover:bg-teal-50">
                View All Specialities
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Patient Stories
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Hear from patients whose lives have been transformed by VitaCare
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                    <div className="flex items-center gap-4 pt-4 border-t">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-teal-700 font-semibold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{testimonial.name}</p>
                        <p className="text-sm text-slate-500">{testimonial.location} • {testimonial.treatment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Your Health is Our Priority
            </h2>
            <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
              Book your appointment today and experience world-class healthcare 
              with VitaCare's team of expert doctors.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={createPageUrl('BookAppointment')}>
                <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 h-14 px-8 text-base">
                  <Calendar className="w-5 h-5 mr-2" />
                  Book Appointment
                </Button>
              </Link>
              <a href="tel:1800-123-4567">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8 text-base">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
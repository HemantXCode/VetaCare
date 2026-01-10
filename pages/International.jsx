import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { 
  Globe, Plane, Hotel, FileText, Phone, Mail, 
  CheckCircle, Star, Award, Users, Clock, Shield,
  Languages, HeartPulse, Building2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const services = [
  {
    icon: Plane,
    title: 'Travel Assistance',
    desc: 'Visa assistance, airport pickup, and travel arrangements'
  },
  {
    icon: Hotel,
    title: 'Accommodation',
    desc: 'Comfortable stay options near our hospitals'
  },
  {
    icon: Languages,
    title: 'Language Support',
    desc: 'Interpreters available in 20+ languages'
  },
  {
    icon: FileText,
    title: 'Medical Reports',
    desc: 'Digital reports and tele-consultations'
  },
  {
    icon: HeartPulse,
    title: 'Second Opinion',
    desc: 'Expert medical opinion from top specialists'
  },
  {
    icon: Shield,
    title: 'Insurance Support',
    desc: 'Help with international health insurance claims'
  }
];

const specialities = [
  { name: 'Cardiac Surgery', savings: 'Up to 80%' },
  { name: 'Orthopedic Surgery', savings: 'Up to 75%' },
  { name: 'Organ Transplants', savings: 'Up to 70%' },
  { name: 'Cancer Treatment', savings: 'Up to 65%' },
  { name: 'Spine Surgery', savings: 'Up to 70%' },
  { name: 'Cosmetic Surgery', savings: 'Up to 60%' }
];

const testimonials = [
  {
    name: 'James Miller',
    country: 'United States',
    treatment: 'Heart Bypass Surgery',
    quote: 'Exceptional care at a fraction of US costs. The doctors were world-class and the coordination was flawless.'
  },
  {
    name: 'Sarah Johnson',
    country: 'United Kingdom',
    treatment: 'Knee Replacement',
    quote: 'From my first inquiry to recovery, VitaCare made everything seamless. Highly recommend for international patients.'
  },
  {
    name: 'Ahmed Hassan',
    country: 'UAE',
    treatment: 'Cancer Treatment',
    quote: 'The oncology team at VitaCare is truly remarkable. They saved my life with their expertise and care.'
  }
];

export default function International() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-teal-600 text-white mb-6">
                <Globe className="w-3 h-3 mr-1" />
                International Patient Services
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                World-Class Healthcare
                <br />
                <span className="text-teal-400">Without Borders</span>
              </h1>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Experience India's finest healthcare with VitaCare's comprehensive international 
                patient services. Save up to 80% on medical treatments while receiving 
                world-class care from our expert physicians.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl('BookAppointment')}>
                  <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                    Request Consultation
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <a href="tel:+911234567890">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Us
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <img 
                src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80"
                alt="International Healthcare"
                className="rounded-3xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '50+', label: 'Countries Served' },
              { value: '25000+', label: 'International Patients' },
              { value: '200+', label: 'Expert Specialists' },
              { value: '4.9', label: 'Patient Rating' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-bold text-teal-600">{stat.value}</p>
                <p className="text-slate-600 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Comprehensive Support Services
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              From your first inquiry to your safe return home, we handle everything
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
                      <service.icon className="w-6 h-6 text-teal-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{service.title}</h3>
                    <p className="text-slate-600">{service.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Savings */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Significant Cost Savings
              </h2>
              <p className="text-slate-600 text-lg mb-8">
                Get world-class medical treatment at a fraction of the cost compared to 
                Western countries, without compromising on quality or safety.
              </p>
              <div className="space-y-4">
                {specialities.map(spec => (
                  <div 
                    key={spec.name}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <span className="font-medium text-slate-800">{spec.name}</span>
                    <Badge className="bg-green-100 text-green-700">
                      {spec.savings} Savings
                    </Badge>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-teal-600 to-teal-700 text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6">Request a Free Quote</h3>
                  <p className="text-teal-100 mb-6">
                    Send us your medical reports and get a detailed treatment plan with cost estimate.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-200" />
                      <span>Free consultation with specialists</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-200" />
                      <span>Detailed cost breakdown</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-200" />
                      <span>Treatment timeline estimate</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-teal-200" />
                      <span>No hidden charges</span>
                    </div>
                  </div>
                  <Button className="w-full mt-8 bg-white text-teal-700 hover:bg-teal-50">
                    Get Free Quote
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              What Our International Patients Say
            </h2>
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
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className="w-5 h-5 text-amber-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-6">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                        <span className="text-teal-700 font-semibold">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{testimonial.name}</p>
                        <p className="text-sm text-slate-500">
                          {testimonial.country} • {testimonial.treatment}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Begin Your Medical Journey?
            </h2>
            <p className="text-teal-100 text-lg mb-8">
              Our dedicated international patient coordinators are available 24/7 to assist you.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a href="tel:+911234567890" className="flex items-center gap-2 bg-white/10 rounded-full px-6 py-3 text-white">
                <Phone className="w-5 h-5" />
                +91 1234 567 890
              </a>
              <a href="mailto:international@vitacare.com" className="flex items-center gap-2 bg-white/10 rounded-full px-6 py-3 text-white">
                <Mail className="w-5 h-5" />
                international@vitacare.com
              </a>
            </div>
            <Link to={createPageUrl('BookAppointment')}>
              <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50">
                Schedule a Free Consultation
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
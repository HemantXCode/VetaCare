import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Heart, Phone, Mail, MapPin, 
  Facebook, Twitter, Instagram, Linkedin, Youtube,
  Apple, PlayCircle
} from 'lucide-react';

const footerLinks = {
  'For Patients': [
    { name: 'Book Appointment', url: 'BookAppointment' },
    { name: 'Find a Doctor', url: 'Doctors' },
    { name: 'Find a Hospital', url: 'Hospitals' },
    { name: 'Patient Portal', url: 'Dashboard' },
    { name: 'Health Records', url: 'Dashboard' },
    { name: 'Pay Bills Online', url: 'Dashboard' }
  ],
  'Centres of Excellence': [
    { name: 'Heart Institute', url: 'Doctors' },
    { name: 'Cancer Centre', url: 'Doctors' },
    { name: 'Bone & Joint Institute', url: 'Doctors' },
    { name: 'Neurosciences', url: 'Doctors' },
    { name: 'Kidney Institute', url: 'Doctors' },
    { name: 'Mother & Child', url: 'Doctors' }
  ],
  'Medical Procedures': [
    { name: 'Cardiac Surgery', url: 'Doctors' },
    { name: 'Knee Replacement', url: 'Doctors' },
    { name: 'Cancer Treatment', url: 'Doctors' },
    { name: 'Kidney Transplant', url: 'Doctors' },
    { name: 'Liver Transplant', url: 'Doctors' },
    { name: 'IVF Treatment', url: 'Doctors' }
  ],
  'Quick Links': [
    { name: 'About Us', url: 'Home' },
    { name: 'Careers', url: 'Home' },
    { name: 'News & Media', url: 'Home' },
    { name: 'Contact Us', url: 'Home' },
    { name: 'Feedback', url: 'Home' },
    { name: 'Sitemap', url: 'Home' }
  ]
};

const socialLinks = [
  { icon: Facebook, url: '#', label: 'Facebook' },
  { icon: Twitter, url: '#', label: 'Twitter' },
  { icon: Instagram, url: '#', label: 'Instagram' },
  { icon: Linkedin, url: '#', label: 'LinkedIn' },
  { icon: Youtube, url: '#', label: 'YouTube' }
];

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to={createPageUrl('Home')} className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-teal-400">Vita</span>
                <span className="text-2xl font-bold text-white">Care</span>
              </div>
            </Link>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              VitaCare is committed to providing world-class healthcare services 
              with compassion and excellence. Our network of hospitals across 
              India serves millions of patients every year.
            </p>
            <div className="space-y-3">
              <a href="tel:+911234567890" className="flex items-center gap-3 text-slate-400 hover:text-teal-400 transition-colors">
                <Phone className="w-5 h-5" />
                <span>1800-123-4567 (Toll Free)</span>
              </a>
              <a href="mailto:info@vitacare.com" className="flex items-center gap-3 text-slate-400 hover:text-teal-400 transition-colors">
                <Mail className="w-5 h-5" />
                <span>info@vitacare.com</span>
              </a>
              <div className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>VitaCare Healthcare Ltd, Tower A, Cyber City, Gurgaon - 122002</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.name}>
                    <Link 
                      to={createPageUrl(link.url)}
                      className="text-slate-400 hover:text-teal-400 text-sm transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social & Apps */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">Follow Us:</span>
              <div className="flex gap-3">
                {socialLinks.map(social => (
                  <a 
                    key={social.label}
                    href={social.url}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-teal-600 transition-colors"
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400 text-sm">Download App:</span>
              <a href="#" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
                <Apple className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-400">Download on</p>
                  <p className="text-sm font-medium">App Store</p>
                </div>
              </a>
              <a href="#" className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
                <PlayCircle className="w-5 h-5" />
                <div className="text-left">
                  <p className="text-[10px] text-slate-400">Get it on</p>
                  <p className="text-sm font-medium">Google Play</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-slate-950 py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2024 VitaCare Healthcare Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-teal-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-teal-400 transition-colors">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
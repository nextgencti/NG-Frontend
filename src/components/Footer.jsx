import React from 'react';
import { 
  Home, 
  BookOpen, 
  User, 
  PhoneCall, 
  Monitor, 
  Book, 
  Award, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Facebook, 
  Youtube, 
  Instagram 
} from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="relative pt-20 pb-10 px-6 overflow-hidden border-t border-slate-200/60 bg-white">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=2070" 
          alt="Footer Background" 
          className="w-full h-full object-cover opacity-[0.15]"
        />
        {/* Gradient Overlay for smooth blending with top section */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white/80 to-transparent pointer-events-none"></div>
      </div>


      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Column 1: Brand */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <Logo className="w-14 h-14" />
              <div>
                <div className="flex items-center text-2xl font-bold tracking-[0.1em] leading-none select-none">
                  <span className="text-slate-900">NEXT</span>
                  <span className="text-primary-600">GEN</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">
                  Computer Training <br /> Institute Muskara
                </p>
              </div>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed font-medium max-w-xs">
              Empowering the next generation of students with world-class computer education and industry-recognized certifications.
            </p>
            {/* Social Icons moved here for better balance */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { Icon: Facebook, color: 'hover:bg-blue-600' },
                { Icon: Youtube, color: 'hover:bg-red-600' },
                { Icon: Instagram, color: 'hover:bg-pink-600' }
              ].map((social, idx) => (
                <a 
                  key={idx} 
                  href="#" 
                  className={`w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white transition-all hover:-translate-y-1 shadow-sm ${social.color}`}
                >
                  <social.Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-8 lg:pl-10">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { name: 'Home', icon: Home, href: '#' },
                { name: 'Courses', icon: BookOpen, href: '#' },
                { name: 'About Us', icon: User, href: '#' },
                { name: 'Contact Us', icon: PhoneCall, href: '#' },
              ].map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="flex items-center gap-3 text-slate-500 hover:text-primary-600 transition-colors group">
                    <link.icon className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                    <span className="text-sm font-bold">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div className="space-y-8 lg:pl-5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Services</h4>
            <ul className="space-y-4">
              {[
                { name: 'Student Portal', icon: Monitor },
                { name: 'Course Catalog', icon: Book },
                { name: 'Verification', icon: Award },
                { name: 'Online Tests', icon: FileText },
              ].map((service) => (
                <li key={service.name} className="flex items-center gap-3 text-slate-500 group cursor-pointer hover:text-primary-600 transition-colors">
                  <service.icon className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-sm font-bold">{service.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Get In Touch */}
          <div className="space-y-8">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.3em]">Get In Touch</h4>
            <div className="space-y-5">
              {[
                { text: '+91 9140737374', icon: Phone, sub: 'Available 10 AM - 6 PM' },
                { text: 'nextgencomputermuskara@gmail.com', icon: Mail, sub: 'Official Email Support' },
                { text: 'Muskara, Hamirpur, UP, 210506', icon: MapPin, sub: 'Main Training Campus' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:border-primary-200 group-hover:bg-primary-50 transition-all shadow-sm">
                    <item.icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-700 block group-hover:text-primary-600 transition-colors">{item.text}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.1em]">Your data is secure with us.</span>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-slate-400 text-xs font-bold tracking-wide">
              © {new Date().getFullYear()} NextGen Institutes. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-[10px] font-black text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-[0.2em]">Privacy Policy</a>
              <div className="h-3 w-px bg-slate-300"></div>
              <a href="#" className="text-[10px] font-black text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-[0.2em]">Terms & Conditions</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


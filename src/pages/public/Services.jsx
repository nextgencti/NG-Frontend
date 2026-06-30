import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, ArrowRight, ShieldCheck, Zap, Users, Trophy, ChevronDown, User, LogOut, Star, Briefcase, FileText, Shield, Download, ExternalLink, ArrowLeft, Search } from 'lucide-react';
import Footer from '../../components/Footer';
import Logo from '../../components/Logo';
import { motion } from 'framer-motion';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://ng-backend-91oz.onrender.com/api';

export default function Services() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [customServices, setCustomServices] = useState([]);

  useEffect(() => {
    fetchCustomServices();
  }, []);

  const fetchCustomServices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/public/gov-services`);
      if (res.data.success) {
        setCustomServices(res.data.services || []);
      }
    } catch (err) {
      console.error("Failed to fetch public services", err);
    }
  };

  const categories = ['All', 'Job Alerts', 'Identity Cards', 'Results & Certs', 'Welfare & Schemes'];

  const servicesData = [
    {
      id: 1,
      name: "Sarkari Result",
      category: "Job Alerts",
      description: "Direct alerts for online forms, exam schedules, admit cards, and exam results across all major central and state government sectors.",
      icon: Briefcase,
      link: "https://www.sarkariresult.com",
      links: [
        { label: "SSC Official Portal", url: "https://ssc.gov.in" },
        { label: "UPSC Official Portal", url: "https://www.upsc.gov.in" }
      ]
    },
    {
      id: 3,
      name: "Aadhaar Portal (UIDAI)",
      category: "Identity Cards",
      description: "Check status of Aadhaar update request, retrieve virtual ID, check linked mobile numbers, and download digital copy of Aadhaar card.",
      icon: Shield,
      link: "https://myaadhaar.uidai.gov.in",
      links: [
        { label: "Aadhaar Services Portal", url: "https://myaadhaar.uidai.gov.in" },
        { label: "Verify Aadhaar Status", url: "https://uidai.gov.in" }
      ]
    },
    {
      id: 7,
      name: "NIELIT CCC Certificate",
      category: "Results & Certs",
      description: "Download Course on Computer Concepts (CCC) exam admit cards, check results, and print digitally signed official certificates.",
      icon: Download,
      link: "https://student.nielit.gov.in",
      links: [
        { label: "Student Portal NIELIT", url: "https://student.nielit.gov.in" }
      ]
    },
    {
      id: 8,
      name: "DigiLocker Services",
      category: "Results & Certs",
      description: "Secure cloud wallet by Gov of India to store and access authentic digital documents (Marksheets, License, RC, Identity cards).",
      icon: Download,
      link: "https://digilocker.gov.in",
      links: [
        { label: "Official Web App", url: "https://digilocker.gov.in" }
      ]
    },
    {
      id: 9,
      name: "UP Scholarship Portal",
      category: "Welfare & Schemes",
      description: "Apply fresh or renewal scholarships for pre-matric, post-matric, and other professional courses in Uttar Pradesh colleges.",
      icon: FileText,
      link: "https://scholarship.up.gov.in",
      links: [
        { label: "Scholarship Portal", url: "https://scholarship.up.gov.in" }
      ]
    },
    {
      id: 10,
      name: "UP e-District Portal",
      category: "Welfare & Schemes",
      description: "Apply income, caste, domicile, birth, and death certificates online directly from UP state public service dashboard.",
      icon: FileText,
      link: "https://edistrict.up.gov.in",
      links: [
        { label: "e-District Login", url: "https://edistrict.up.gov.in" }
      ]
    }
  ];

  const displayServices = customServices.length > 0 ? customServices : servicesData;

  const filteredServices = displayServices.filter(service => {
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (service.tagline && service.tagline.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3FF] via-[#FAF9FF] to-white overflow-hidden relative selection:bg-indigo-500/10">
      
      {/* Top ambient decorative lights */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F0C20]/70 backdrop-blur-md border-b border-indigo-950/45 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navigate('/')}>
            <div className="bg-white p-1.5 rounded-xl shadow-sm border border-white/10 flex items-center justify-center shrink-0">
              <Logo className="w-8 h-8" showText={false} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[25px] sm:text-[30px] font-helvetica-light tracking-wide leading-none flex items-center">
                <span className="text-white">Next</span>
                <span className="text-indigo-400 ml-0.5">Gen</span>
              </h2>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')} 
            className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-indigo-500/35 text-slate-200 hover:text-white rounded-full font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-36 pb-24 relative z-10">
        
        {/* Header Title Section */}
        <div className="text-center mb-16 animate-in fade-in duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-5">
            <ShieldCheck className="w-4 h-4 fill-indigo-600/10 text-indigo-600" />
            <span>Digital Assistance Directory</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-none">
            Government Services & <span className="text-indigo-700">Jobs Directory</span>
          </h1>
          <p className="text-slate-500 font-medium text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
            Direct online portals for public utility services, certificate download platforms, scholarship registrations, and Sarkari recruitment updates.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white/80 backdrop-blur-xl border border-indigo-100/80 rounded-3xl p-5 shadow-sm mb-12 flex flex-col md:flex-row items-center justify-between gap-5 text-left">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services (e.g. SSC, PAN, Aadhaar)..."
              className="w-full bg-indigo-50/40 border border-indigo-100 focus:border-indigo-500 text-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs font-semibold outline-none transition-colors placeholder-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide py-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4.5 py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/15'
                    : 'bg-indigo-50/40 border border-indigo-100/40 text-slate-500 hover:text-slate-800 hover:bg-indigo-100/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid List of Services */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredServices.map((service) => {
              const categoryIconMap = {
                'Job Alerts': Briefcase,
                'Identity Cards': Shield,
                'Results & Certs': Download,
                'Welfare & Schemes': FileText
              };
              const ServiceIcon = service.icon || categoryIconMap[service.category] || Briefcase;
              return (
                <motion.div
                  layout
                  key={service.id}
                  className="relative group flex flex-col h-full hover:-translate-y-2 transition-all duration-500 isolate text-left"
                >
                  {/* Backdrop Ambient Glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-hover:scale-[1.05] group-hover:blur-2xl transition-all duration-500 -z-10" />
                  
                  {/* Card Main Container */}
                  <div className="bg-white/80 hover:bg-white/95 backdrop-blur-xl rounded-2xl border border-indigo-100/80 group-hover:border-indigo-300/80 shadow-[0_8px_30px_rgba(99,102,241,0.02)] group-hover:shadow-[0_20px_50px_rgba(99,102,241,0.18)] transition-all duration-500 flex flex-col flex-1 overflow-hidden relative p-5">
                    {/* Always visible base top border */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-indigo-950 z-20" />
                    
                    {/* Hover state gradient top border */}
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30" />
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 overflow-hidden">
                        {service.imageUrl ? (
                          <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                        ) : (
                          <ServiceIcon className="w-5 h-5" />
                        )}
                      </div>
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black uppercase px-2 py-0.5 rounded">
                        {service.category}
                      </span>
                    </div>

                    <h3 className="text-base font-NeueMachina-Medium text-slate-800 leading-snug mb-3">
                      {service.name}
                    </h3>
                    <p className="text-slate-500 text-xs font-semibold leading-relaxed mb-6 flex-1">
                      {service.description}
                    </p>

                    {/* Secondary links */}
                    {service.links && service.links.length > 0 && (
                      <div className="space-y-2 mb-5 font-NeueMachina-Medium">
                        {service.links.map((sublink, idx) => (
                          <a 
                            key={idx} 
                            href={sublink.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center justify-between text-[10px] text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50/40 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-100/30 transition-all"
                          >
                            <span>{sublink.label}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Primary Portal Action */}
                    {service.hasDetailsPage ? (
                      <Link
                        to={`/services/${service.id}`}
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-NeueMachina-Medium font-bold text-[13px] tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        View Details & Apply <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <a
                        href={service.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl font-NeueMachina-Medium font-bold text-[13px] tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        Open Official Portal <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white/50 border border-indigo-100/50 rounded-2xl p-12 text-slate-400 font-semibold text-center flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
            <span>No services found matching your criteria. Try searching for other keywords.</span>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}

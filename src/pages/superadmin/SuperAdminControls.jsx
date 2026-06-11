import React, { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Database, FileText, Save, Loader2, Info, Plus, Trash2, Edit, ExternalLink, Image, Globe, Tag, Keyboard } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

export default function SuperAdminControls() {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' or 'services'
  
  // Settings Tab State
  const [settings, setSettings] = useState({
    homepageStats: {
      showStats: true,
      dataSource: 'dummy',
      dummyData: {
        studentsCount: 14,
        coursesCount: 1,
        successRate: 95,
        certificatesCount: 24
      }
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Services Tab State
  const [services, setServices] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const [serviceForm, setServiceForm] = useState({
    name: '',
    tagline: '',
    description: '',
    link: '',
    category: '',
    imageFile: null,
    imagePreviewUrl: ''
  });

  // Typing Paragraphs State
  const [typingParagraphs, setTypingParagraphs] = useState([]);
  const [isTypingLoading, setIsTypingLoading] = useState(false);
  const [typingForm, setTypingForm] = useState({
    language: 'english',
    mode: 'normal',
    text: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'services') {
      fetchServices();
    } else if (activeTab === 'typing') {
      fetchTypingParagraphs();
    }
  }, [activeTab]);

  const fetchTypingParagraphs = async () => {
    setIsTypingLoading(true);
    try {
      const response = await api.get('/superadmin/typing-paragraphs');
      if (response.data.success && response.data.paragraphs) {
        setTypingParagraphs(response.data.paragraphs);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch typing paragraphs');
    } finally {
      setIsTypingLoading(false);
    }
  };

  const handleSaveTypingParagraph = async (e) => {
    e.preventDefault();
    setIsFormSubmitting(true);
    try {
      const response = await api.post('/superadmin/typing-paragraphs', typingForm);
      if (response.data.success) {
        toast.success('Typing paragraph added successfully');
        setTypingForm({ language: 'english', mode: 'normal', text: '' });
        fetchTypingParagraphs();
      } else {
        toast.error(response.data.message || 'Failed to add paragraph');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error adding paragraph');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteTypingParagraph = async (id) => {
    if (!window.confirm('Are you sure you want to delete this paragraph?')) return;
    try {
      const response = await api.delete(`/superadmin/typing-paragraphs/${id}`);
      if (response.data.success) {
        toast.success('Paragraph deleted successfully');
        fetchTypingParagraphs();
      } else {
        toast.error('Failed to delete paragraph');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error deleting paragraph');
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/superadmin/web-controls');
      if (response.data.success && response.data.settings) {
        setSettings(response.data.settings);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServices = async () => {
    setIsServicesLoading(true);
    try {
      const response = await api.get('/superadmin/gov-services');
      if (response.data.success && response.data.services) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch government services');
    } finally {
      setIsServicesLoading(false);
    }
  };

  const handleToggleShowStats = () => {
    setSettings(prev => ({
      ...prev,
      homepageStats: {
        ...prev.homepageStats,
        showStats: !prev.homepageStats.showStats
      }
    }));
  };

  const handleDataSourceChange = (source) => {
    setSettings(prev => ({
      ...prev,
      homepageStats: {
        ...prev.homepageStats,
        dataSource: source
      }
    }));
  };

  const handleDummyDataChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      homepageStats: {
        ...prev.homepageStats,
        dummyData: {
          ...prev.homepageStats.dummyData,
          [field]: value
        }
      }
    }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.post('/superadmin/web-controls', settings);
      if (response.data.success) {
        toast.success('Webpage settings saved successfully');
      } else {
        toast.error(response.data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Services Helper Functions
  const resetServiceForm = () => {
    setServiceForm({
      name: '',
      tagline: '',
      description: '',
      link: '',
      category: '',
      imageFile: null,
      imagePreviewUrl: ''
    });
  };

  const handleOpenAddModal = () => {
    setCurrentService(null);
    resetServiceForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setCurrentService(service);
    setServiceForm({
      name: service.name || '',
      tagline: service.tagline || '',
      description: service.description || '',
      link: service.link || '',
      category: service.category || '',
      imageFile: null,
      imagePreviewUrl: service.imageUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setServiceForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreviewUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setIsFormSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', serviceForm.name);
      formData.append('tagline', serviceForm.tagline);
      formData.append('description', serviceForm.description);
      formData.append('link', serviceForm.link);
      formData.append('category', serviceForm.category);
      if (serviceForm.imageFile) {
        formData.append('image', serviceForm.imageFile);
      }

      let response;
      if (currentService) {
        // Edit Mode
        response = await api.put(`/superadmin/gov-services/${currentService.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // Create Mode
        response = await api.post('/superadmin/gov-services', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (response.data.success) {
        toast.success(currentService ? 'Service updated successfully' : 'Service created successfully');
        setIsModalOpen(false);
        resetServiceForm();
        fetchServices();
      } else {
        toast.error(response.data.message || 'Failed to save service');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error saving government service');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Are you sure you want to delete this government service?')) return;
    
    try {
      const response = await api.delete(`/superadmin/gov-services/${id}`);
      if (response.data.success) {
        toast.success('Service deleted successfully');
        fetchServices();
      } else {
        toast.error(response.data.message || 'Failed to delete service');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete service');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-6 w-6 text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Webpage Controls</h2>
          <p className="text-xs font-medium text-slate-500">Manage visibility and content displayed on the public website.</p>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-4 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-2 px-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span>Web Settings</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`pb-2 px-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'services'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span>Gov Services</span>
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('typing')}
          className={`pb-2 px-2 text-xs font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeTab === 'typing'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4" />
            <span>Typing Test</span>
          </div>
        </button>
      </div>

      {activeTab === 'settings' ? (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* Statistics Section Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Homepage Statistics</h3>
                  <p className="text-[11px] text-slate-500">Control the counters section (Students, Courses, Success Rate, Certificates) on the landing page.</p>
                </div>
              </div>
              {/* Show/Hide Switch Toggle */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold transition-colors duration-200 ${
                  settings.homepageStats.showStats ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {settings.homepageStats.showStats ? 'Showing' : 'Hidden'}
                </span>
                <button
                  type="button"
                  onClick={handleToggleShowStats}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.homepageStats.showStats ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      settings.homepageStats.showStats ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* ShowStats state description */}
              {!settings.homepageStats.showStats && (
                <div className="p-3 bg-amber-50 border border-amber-200/60 rounded-xl flex items-start gap-2.5 text-amber-800">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="text-xs font-medium leading-relaxed">
                    The statistics section is currently <strong>hidden</strong> on the public website. Saving these changes will keep the card hidden, but you can configure data options below for when it is shown again.
                  </p>
                </div>
              )}

              {/* Choose Data Source */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Data Source Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Dummy Data Option */}
                  <button
                    type="button"
                    onClick={() => handleDataSourceChange('dummy')}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 group ${
                      settings.homepageStats.dataSource === 'dummy'
                        ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
                      settings.homepageStats.dataSource === 'dummy'
                        ? 'bg-primary-100 text-primary-600 border-primary-200'
                        : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:text-slate-600 group-hover:border-slate-200'
                    }`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Dummy Data (Recommended)</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Show customized values you input manually below. Recommended to keep counts looking professional.</p>
                    </div>
                  </button>

                  {/* Real Data Option */}
                  <button
                    type="button"
                    onClick={() => handleDataSourceChange('real')}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 group ${
                      settings.homepageStats.dataSource === 'real'
                        ? 'border-primary-500 bg-primary-50/30 ring-1 ring-primary-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
                      settings.homepageStats.dataSource === 'real'
                        ? 'bg-primary-100 text-primary-600 border-primary-200'
                        : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:text-slate-600 group-hover:border-slate-200'
                    }`}>
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Real Data (Dynamic)</h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Automatically compute metrics dynamically by scanning live students, courses, and test results.</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Config Dummy Values Form */}
              {settings.homepageStats.dataSource === 'dummy' && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="h-px bg-slate-100"></div>
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-primary-500" />
                    <h4 className="text-xs font-bold text-slate-900">Configure Dummy Values</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Students Empowered */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Students Empowered</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          required
                          value={settings.homepageStats.dummyData.studentsCount}
                          onChange={(e) => handleDummyDataChange('studentsCount', e.target.value)}
                          className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">+</span>
                      </div>
                    </div>

                    {/* Courses Available */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Courses Available</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          required
                          value={settings.homepageStats.dummyData.coursesCount}
                          onChange={(e) => handleDummyDataChange('coursesCount', e.target.value)}
                          className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">+</span>
                      </div>
                    </div>

                    {/* Success Rate */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Success Rate (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          required
                          value={settings.homepageStats.dummyData.successRate}
                          onChange={(e) => handleDummyDataChange('successRate', e.target.value)}
                          className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">%</span>
                      </div>
                    </div>

                    {/* Certificates Issued */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Certificates Issued</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          required
                          value={settings.homepageStats.dummyData.certificatesCount}
                          onChange={(e) => handleDummyDataChange('certificatesCount', e.target.value)}
                          className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm pointer-events-none">+</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Bar */}
          <div className="flex justify-end gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin w-3.5 h-3.5 text-white" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Controls
                </>
              )}
            </button>
          </div>
        </form>
      ) : activeTab === 'services' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            {/* Gov Services List */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Government Portal Services ({services.length})</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Add, edit, or delete external links to government services directories shown on the landing page.</p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Service
              </button>
            </div>

            {isServicesLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin h-6 w-6 text-primary-500" />
              </div>
            ) : services.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 flex flex-col items-center justify-center gap-2">
                <Globe className="w-8 h-8 text-slate-400 mb-1" />
                <h4 className="text-xs font-bold text-slate-700">No Custom Services Added</h4>
                <p className="text-[11px] text-slate-400 max-w-sm">The landing page is currently showing the default static services. Click the button above to add custom portal services with custom image icons.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="p-5 border border-slate-200 rounded-2xl bg-white hover:border-slate-300 hover:shadow-md transition-all flex items-start gap-4 text-left group relative">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center shrink-0">
                      {service.imageUrl ? (
                        <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                      ) : (
                        <Globe className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-12">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100/40">
                          {service.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate mb-0.5">{service.name}</h4>
                      {service.tagline && (
                        <p className="text-[10px] text-indigo-600 font-extrabold truncate mb-1">{service.tagline}</p>
                      )}
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{service.description || 'No description provided.'}</p>
                      <a 
                        href={service.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-primary-500 font-bold hover:underline inline-flex items-center gap-1 mt-2.5"
                      >
                        Visit Link <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="absolute right-4 top-4 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(service)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200/50 rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteService(service.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'typing' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Typing Test Paragraphs ({typingParagraphs.length})</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Manage custom typing paragraphs for public users.</p>
              </div>
            </div>

            <form onSubmit={handleSaveTypingParagraph} className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/50 p-4 border border-slate-200 rounded-2xl mb-6">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Language</label>
                <select 
                  value={typingForm.language} 
                  onChange={(e) => setTypingForm(prev => ({...prev, language: e.target.value}))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                >
                  <option value="english">English</option>
                  <option value="javascript">JavaScript</option>
                  <option value="numbers">Numbers</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Mode</label>
                <select 
                  value={typingForm.mode} 
                  onChange={(e) => setTypingForm(prev => ({...prev, mode: e.target.value}))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1 mb-1 block">Text</label>
                <textarea 
                  required 
                  value={typingForm.text} 
                  onChange={(e) => setTypingForm(prev => ({...prev, text: e.target.value}))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl outline-none min-h-[80px]"
                  placeholder="Enter typing text..."
                />
              </div>
              <div className="sm:col-span-3 flex justify-end">
                <button type="submit" disabled={isFormSubmitting} className="px-5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl cursor-pointer">
                  {isFormSubmitting ? 'Saving...' : 'Add Paragraph'}
                </button>
              </div>
            </form>

            {isTypingLoading ? (
              <div className="flex justify-center"><Loader2 className="animate-spin w-6 h-6 text-primary-500" /></div>
            ) : typingParagraphs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No custom paragraphs added yet.</p>
            ) : (
              <div className="space-y-3">
                {typingParagraphs.map(para => (
                  <div key={para.id} className="p-4 border border-slate-200 rounded-xl flex items-start justify-between bg-white">
                    <div className="flex-1 pr-4">
                      <div className="flex gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{para.language}</span>
                        <span className="text-[10px] font-bold uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded">{para.mode}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-mono">{para.text}</p>
                    </div>
                    <button onClick={() => handleDeleteTypingParagraph(para.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Modal Dialog for Add/Edit Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900">
                {currentService ? 'Edit Portal Service' : 'Add New Portal Service'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSaveService} className="p-6 space-y-4">
              {/* Category selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Category</label>
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full pl-3 pr-8 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                >
                  <option value="">Select Category</option>
                  <option value="Job Alerts">Job Alerts</option>
                  <option value="Identity Cards">Identity Cards</option>
                  <option value="Results & Certs">Results & Certs</option>
                  <option value="Welfare & Schemes">Welfare & Schemes</option>
                </select>
              </div>

              {/* Service Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Service Name / Title</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. SSC Job Alerts"
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Tagline (Quick Info)</label>
                <input
                  type="text"
                  value={serviceForm.tagline}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, tagline: e.target.value }))}
                  placeholder="e.g. SSC CGL, CHSL, MTS recruitment"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Description (Detailed)</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the portal guidelines and uses..."
                  rows="3"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Portal Link */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Portal Link URL</label>
                <input
                  type="url"
                  value={serviceForm.link}
                  onChange={(e) => setServiceForm(prev => ({ ...prev, link: e.target.value }))}
                  placeholder="e.g. https://ssc.gov.in"
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>

              {/* File Upload / Image logo */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Service Icon / Photo Logo</label>
                <div className="flex items-center gap-4">
                  {/* Image Preview */}
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200/60 overflow-hidden flex items-center justify-center shrink-0">
                    {serviceForm.imagePreviewUrl ? (
                      <img src={serviceForm.imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Image className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  
                  {/* File Input */}
                  <div className="flex-1">
                    <input
                      type="file"
                      id="service-image-upload"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="service-image-upload"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-800 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {serviceForm.imagePreviewUrl ? 'Change Image' : 'Choose File'}
                    </label>
                    <p className="text-[9px] text-slate-400 mt-1">Recommended: Square PNG/JPEG image (max 2MB).</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4.5 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isFormSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isFormSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-3.5 h-3.5 text-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      {currentService ? 'Update Service' : 'Add Service'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Store, 
  ShieldCheck, 
  PlusCircle, 
  FileText, 
  Clock, 
  DollarSign, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Save,
  Send
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function OwnerPortal() {
  const { currentUser, addToast } = useApp();

  const [activeOwnerTab, setActiveOwnerTab] = useState('register'); // 'register' | 'verify' | 'services' | 'inquiries'
  
  // Registration Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'Home Services',
    subcategory: 'Electricians',
    description: '',
    phone: '+91 ',
    email: '',
    website: '',
    address: '',
    area: 'Indiranagar',
    pincode: '560038',
    city: 'Bengaluru',
    price_tier: '₹₹',
    price_range_text: '₹299 - ₹999'
  });
  const [registeredBusiness, setRegisteredBusiness] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  // Verification Form State
  const [verificationDoc, setVerificationDoc] = useState({
    business_id: '',
    business_name: '',
    document_type: 'Trade License & GSTIN',
    document_number: '',
    document_file_url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    notes: ''
  });
  const [isSubmittingVerify, setIsSubmittingVerify] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // New Service Addition State
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30 mins');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Inquiries State
  const [inquiries, setInquiries] = useState([
    {
      id: 'inq-demo-1',
      customer_name: 'Priya Narayanan',
      customer_phone: '+91 97400 99887',
      service_requested: 'Electrical Inspection',
      message: 'Need urgent diagnosis for switchboard tripping on Saturday morning.',
      date: '2 hours ago',
      status: 'new'
    },
    {
      id: 'inq-demo-2',
      customer_name: 'Karthik Raja',
      customer_phone: '+91 98860 33441',
      service_requested: 'Price Estimate',
      message: 'Looking for rewiring and fan installation in 3BHK flat.',
      date: 'Yesterday',
      status: 'contacted'
    }
  ]);

  const handleRegisterBusiness = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      addToast('Please fill all required business fields', 'warning');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await api.createBusiness({
        ...formData,
        owner_id: currentUser?.id || 'usr-owner-1'
      });

      if (res.data) {
        setRegisteredBusiness(res.data);
        setVerificationDoc(prev => ({
          ...prev,
          business_id: res.data.id,
          business_name: res.data.name
        }));
        addToast('Business registered successfully! Next step: Submit verification documents.', 'success');
        setActiveOwnerTab('verify');
      }
    } catch {
      addToast('Failed to register business', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    if (!verificationDoc.document_number.trim()) {
      addToast('Please provide your formal registration / license number', 'warning');
      return;
    }

    setIsSubmittingVerify(true);
    try {
      await api.submitVerification({
        business_id: registeredBusiness?.id || 'biz-elec-1',
        business_name: registeredBusiness?.name || 'PowerVolt Electrical',
        owner_name: currentUser?.full_name || 'Rajesh Sharma',
        owner_email: currentUser?.email || 'owner@localconnect.com',
        ...verificationDoc
      });

      setVerificationSuccess(true);
      addToast('Verification request received! Our trust and safety officers will verify your license.', 'success');
    } catch {
      addToast('Failed to submit verification request', 'error');
    } finally {
      setIsSubmittingVerify(false);
    }
  };

  const handleAddService = (e) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newServicePrice) {
      addToast('Enter service name and price', 'warning');
      return;
    }

    addToast(`Service "${newServiceName}" added to catalog at ₹${newServicePrice}`, 'success');
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDesc('');
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-600 via-brand-600 to-indigo-700 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Store className="w-4 h-4" />
            LocalConnect Merchant & Partner Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Business Owner Workspace
          </h1>
          <p className="text-xs sm:text-sm text-amber-100 max-w-xl mt-1">
            Manage your local presence, get verified with our trust badge, publish transparent pricing, and receive verified customer inquiries.
          </p>
        </div>

        {/* Quick Analytics Counters */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 shrink-0">
          <div className="text-center px-3 border-r border-white/20">
            <span className="text-2xl font-black">280+</span>
            <span className="text-[10px] text-amber-200 block uppercase font-semibold">Monthly Views</span>
          </div>
          <div className="text-center px-3">
            <span className="text-2xl font-black">18</span>
            <span className="text-[10px] text-amber-200 block uppercase font-semibold">Customer Calls</span>
          </div>
        </div>
      </div>

      {/* Owner Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveOwnerTab('register')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeOwnerTab === 'register'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Register Business</span>
        </button>

        <button
          onClick={() => setActiveOwnerTab('verify')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeOwnerTab === 'verify'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Submit Verification Docs</span>
        </button>

        <button
          onClick={() => setActiveOwnerTab('services')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeOwnerTab === 'services'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Catalog & Services</span>
        </button>

        <button
          onClick={() => setActiveOwnerTab('inquiries')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeOwnerTab === 'inquiries'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Customer Leads ({inquiries.length})</span>
        </button>
      </div>

      {/* TAB 1: REGISTER BUSINESS */}
      {activeOwnerTab === 'register' && (
        <form
          onSubmit={handleRegisterBusiness}
          className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-5 animate-in fade-in"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Register New Local Business
            </h2>
            <p className="text-xs text-slate-500">
              Provide authentic contact details and opening hours so nearby customers can discover you
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Electricals & Lighting"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value="Home Services">Home Services (Electrician, Plumber, AC)</option>
                <option value="Restaurants & Cafes">Restaurants & Cafes</option>
                <option value="Healthcare & Dental">Healthcare & Dental Clinics</option>
                <option value="Salons & Beauty">Salons & Beauty</option>
                <option value="Grocery Stores">Grocery Stores & Supermarkets</option>
                <option value="Electronics & Repairs">Electronics & Mobile Repairs</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Verified Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="+91 80 4123 4567"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Business Email Address
              </label>
              <input
                type="email"
                placeholder="contact@business.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                placeholder="Shop #12, 100ft Road, HAL 2nd Stage"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Area / Locality *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Indiranagar"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                PIN Code *
              </label>
              <input
                type="text"
                required
                placeholder="560038"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Description of Services
              </label>
              <textarea
                rows={3}
                placeholder="Describe your primary offerings, warranty terms, and home visit policies..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isRegistering}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-102 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isRegistering ? 'Registering...' : 'Register Business'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: VERIFICATION SUBMISSION */}
      {activeOwnerTab === 'verify' && (
        <form
          onSubmit={handleSubmitVerification}
          className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-5 animate-in fade-in"
        >
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Submit Official Verification Documents
            </h2>
            <p className="text-xs text-slate-500">
              Verified businesses receive 3.5x more inquiries and a verified shield badge on search cards
            </p>
          </div>

          {verificationSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-200">
                Verification Request Under Review
              </h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-300 max-w-md mx-auto">
                Your license credentials have been forwarded to the LocalConnect Administrator queue. You will see the green verified badge activated upon review!
              </p>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Document Type *
                  </label>
                  <select
                    value={verificationDoc.document_type}
                    onChange={(e) => setVerificationDoc({ ...verificationDoc, document_type: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="Trade License & GSTIN">Commercial Trade License & GSTIN</option>
                    <option value="FSSAI Food License">FSSAI Food Safety License</option>
                    <option value="Govt Electrical Contractor License">Govt Electrical Contractor License</option>
                    <option value="Medical / Dental Establishment Registration">Clinical / Dental Establishment Act</option>
                    <option value="MSME Udyam Registration">MSME Udyam Registration</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Official License / Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 29ABCDE1234F1Z5 or EL-KAR-2024-911"
                    value={verificationDoc.document_number}
                    onChange={(e) => setVerificationDoc({ ...verificationDoc, document_number: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Document Scan / Evidence File URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://... (Scan of registration certificate)"
                    value={verificationDoc.document_file_url}
                    onChange={(e) => setVerificationDoc({ ...verificationDoc, document_file_url: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-[11px]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Submission Notes for Administrator
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Renewed license valid till Dec 2026. Trade registry verified at Bangalore East BBMP."
                    value={verificationDoc.notes}
                    onChange={(e) => setVerificationDoc({ ...verificationDoc, notes: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingVerify}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isSubmittingVerify ? 'Submitting...' : 'Submit Verification Evidence'}</span>
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* TAB 3: SERVICES CATALOG */}
      {activeOwnerTab === 'services' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-5 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Manage Products & Services Catalog
            </h2>
            <p className="text-xs text-slate-500">
              Transparent upfront pricing builds trust with customers searching via chatbot
            </p>
          </div>

          <form onSubmit={handleAddService} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Service Name *</label>
              <input
                type="text"
                placeholder="e.g., MCB Replacement"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-500 mb-1">Price (₹) *</label>
              <input
                type="number"
                placeholder="399"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-500 mb-1">Estimated Duration</label>
              <input
                type="text"
                placeholder="e.g. 45 mins"
                value={newServiceDuration}
                onChange={(e) => setNewServiceDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-brand-600 text-white rounded-xl font-semibold text-xs"
              >
                + Add Service to Menu
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: INQUIRIES & LEADS */}
      {activeOwnerTab === 'inquiries' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Customer Leads & Callback Inquiries
            </h2>
            <p className="text-xs text-slate-500">
              Inquiries generated directly from chatbot recommendations and profile cards
            </p>
          </div>

          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {inq.customer_name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300 font-medium text-[10px]">
                      {inq.service_requested}
                    </span>
                    <span className="text-slate-400 text-[10px]">• {inq.date}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300">
                    "{inq.message}"
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`tel:${inq.customer_phone}`}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Customer</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { X, Send, Phone, User, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function InquiryModal() {
  const { inquiryBusiness, setInquiryBusiness, addToast, currentUser } = useApp();

  const [name, setName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 ');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!inquiryBusiness) return null;

  const { business, service } = inquiryBusiness;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      addToast('Please complete all inquiry fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      await api.sendInquiry(business.id, {
        customer_name: name,
        customer_phone: phone,
        service_requested: service?.name || 'General Inquiry',
        message
      });

      setIsSent(true);
      addToast('Callback request sent to business owner!', 'success');
    } catch {
      addToast('Failed to send inquiry', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Request Callback / Booking
            </h2>
            <p className="text-xs text-slate-500">
              Direct inquiry to <strong>{business.name}</strong>
            </p>
          </div>
          <button
            onClick={() => setInquiryBusiness(null)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {service && (
          <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-800 text-xs flex justify-between items-center">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Selected Service</span>
              <span className="font-bold text-brand-700 dark:text-brand-300">{service.name}</span>
            </div>
            <span className="font-extrabold text-emerald-600 text-sm">₹{service.price}</span>
          </div>
        )}

        {isSent ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Inquiry Sent Successfully!
            </h3>
            <p className="text-xs text-slate-500">
              The merchant has received your contact details and will call you on <strong>{phone}</strong> shortly.
            </p>
            <button
              onClick={() => setInquiryBusiness(null)}
              className="mt-3 px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priya Narayanan"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Phone Number (for merchant callback) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98801 23456"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Message / Preferred Time *
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or preferred time for service visit..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Sending...' : 'Send Inquiry to Business'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

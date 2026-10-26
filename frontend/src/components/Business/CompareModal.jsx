import React from 'react';
import { 
  X, 
  Scale, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Trash2,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CompareModal() {
  const { 
    compareList, 
    removeFromCompare, 
    clearCompare, 
    isCompareOpen, 
    setIsCompareOpen,
    openBusinessDetails 
  } = useApp();

  if (!isCompareOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div 
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Compare Local Businesses
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Side-by-side comparison of verified credentials, ratings, and pricing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {compareList.length > 0 && (
              <button
                onClick={clearCompare}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={() => setIsCompareOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Table / Columns */}
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
          {compareList.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Scale className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No businesses selected for comparison yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click the <strong>Compare (⚖️)</strong> icon on any business card in chat or search to view them side-by-side here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-[600px]">
              {compareList.map((biz) => (
                <div
                  key={biz.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-4 flex flex-col justify-between space-y-4 shadow-xs"
                >
                  <div className="space-y-3">
                    {/* Top Row: Category & Remove */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-300">
                        {biz.subcategory || biz.category}
                      </span>
                      <button
                        onClick={() => removeFromCompare(biz.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-500"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Image & Title */}
                    <img
                      src={biz.photos?.[0]}
                      alt={biz.name}
                      className="w-full h-32 object-cover rounded-xl"
                    />

                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                        {biz.name}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {biz.area}, {biz.city}
                      </p>
                    </div>

                    {/* Comparison Attributes */}
                    <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-700/60 pt-1">
                      
                      {/* Verification */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Verification</span>
                        {biz.is_verified ? (
                          <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="text-amber-500 font-medium text-[11px]">Unverified</span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Rating</span>
                        <div className="flex items-center gap-1 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{biz.rating.toFixed(1)}</span>
                          <span className="text-slate-400 text-[10px]">({biz.review_count})</span>
                        </div>
                      </div>

                      {/* Distance */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Distance</span>
                        <span className="font-semibold text-brand-600 dark:text-brand-400">
                          {biz.distance_km != null ? `${biz.distance_km} km` : 'Near you'}
                        </span>
                      </div>

                      {/* Price Range */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Estimated Pricing</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                          {biz.price_range_text}
                        </span>
                      </div>

                      {/* Current Status */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Status</span>
                        <span className={`font-semibold ${biz.is_open_now ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {biz.hours_status}
                        </span>
                      </div>

                      {/* Services preview */}
                      <div className="pt-2 space-y-1">
                        <span className="text-slate-400 font-medium block">Key Services</span>
                        <div className="space-y-1">
                          {biz.services?.slice(0, 3).map((s) => (
                            <div key={s.id} className="flex justify-between text-[11px]">
                              <span className="truncate max-w-[130px]">{s.name}</span>
                              <strong className="text-emerald-600">₹{s.price}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        setIsCompareOpen(false);
                        openBusinessDetails(biz.id);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>View Full Profile</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        window.location.href = `tel:${biz.phone}`;
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Call {biz.phone}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

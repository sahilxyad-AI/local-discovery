import React from 'react';
import { 
  Star, 
  MapPin, 
  Phone, 
  Navigation, 
  ShieldCheck, 
  Clock, 
  Scale, 
  Heart, 
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BusinessCard({ business, compact = false, onSelect }) {
  const { 
    openBusinessDetails, 
    addToCompare, 
    compareList, 
    favorites, 
    toggleFavorite,
    userLocation
  } = useApp();

  if (!business) return null;

  const isCompared = compareList.some(b => b.id === business.id);
  const isFav = favorites.includes(business.id);

  const handleDirections = (e) => {
    e.stopPropagation();
    const dest = `${business.latitude},${business.longitude}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
    window.open(url, '_blank');
  };

  const handleCall = (e) => {
    e.stopPropagation();
    window.location.href = `tel:${business.phone}`;
  };

  const handleCardClick = () => {
    if (onSelect) onSelect(business);
    else openBusinessDetails(business.id);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between bg-white dark:bg-slate-800/90 rounded-2xl border transition-all duration-300 hover:shadow-xl cursor-pointer overflow-hidden ${
        isCompared 
          ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md' 
          : 'border-slate-200/80 dark:border-slate-700/80 hover:border-brand-300 dark:hover:border-brand-600'
      } ${compact ? 'max-w-xs shrink-0' : 'w-full'}`}
    >
      <div>
        {/* Cover Photo & Badges */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
          <img
            src={business.photos?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'}
            alt={business.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

          {/* Verification Badge */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
            {business.is_verified ? (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold backdrop-blur-md shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/90 text-white text-[11px] font-semibold backdrop-blur-md shadow-sm">
                Unverified Demo
              </span>
            )}
            
            <span className="px-2 py-0.5 rounded-full bg-slate-900/70 text-slate-200 text-[10px] font-medium backdrop-blur-md">
              {business.subcategory || business.category}
            </span>
          </div>

          {/* Top Right: Favorite & Compare buttons */}
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(business.id);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                isFav 
                  ? 'bg-rose-500 text-white shadow-md scale-110' 
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
              title={isFav ? 'Remove from favorites' : 'Save to favorites'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCompare(business);
              }}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                isCompared 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
              title={isCompared ? 'Remove from compare' : 'Compare business'}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Overlay Info: Rating & Live Hours */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
            <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold">{business.rating > 0 ? business.rating.toFixed(1) : 'New'}</span>
              <span className="text-slate-300 text-[10px]">({business.review_count})</span>
            </div>

            <div className="flex items-center gap-1.5 bg-black/50 px-2 py-1 rounded-lg backdrop-blur-sm text-[11px]">
              <span className={`w-2 h-2 rounded-full ${business.is_open_now ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <span className="font-medium text-slate-100">
                {business.is_open_now ? 'Open Now' : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-2.5">
          {/* Business Title & Price Tier */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-1">
              {business.name}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0">
              {business.price_tier || '₹₹'}
            </span>
          </div>

          {/* Location & Distance */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{business.area}, {business.city}</span>
            </div>
            {business.distance_km != null && (
              <span className="shrink-0 font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-1.5 py-0.5 rounded text-[11px]">
                {business.distance_km} km away
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {business.description}
          </p>

          {/* Service Highlights / Tags */}
          {business.services && business.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {business.services.slice(0, 2).map((srv) => (
                <span
                  key={srv.id}
                  className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                >
                  {srv.name} <strong className="ml-1 text-emerald-600 dark:text-emerald-400">₹{srv.price}</strong>
                </span>
              ))}
              {business.services.length > 2 && (
                <span className="text-[10px] text-slate-400 font-medium self-center">
                  +{business.services.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Price Range Notice */}
          <div className="text-[11px] text-slate-400 font-medium">
            Est. Price: <span className="text-slate-600 dark:text-slate-200">{business.price_range_text}</span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            openBusinessDetails(business.id);
          }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
        >
          View Details
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleDirections}
          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          title="Get Directions"
        >
          <Navigation className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
        </button>

        <button
          onClick={handleCall}
          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
          title={`Call ${business.phone}`}
        >
          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </button>
      </div>
    </div>
  );
}

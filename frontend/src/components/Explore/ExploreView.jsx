import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  SlidersHorizontal, 
  Star, 
  ShieldCheck, 
  Clock, 
  Layers, 
  ArrowUpDown,
  Compass,
  ChevronDown
} from 'lucide-react';
import L from 'leaflet';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';
import BusinessCard from '../Business/BusinessCard';

export default function ExploreView() {
  const { userLocation, openBusinessDetails } = useApp();

  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [radius, setRadius] = useState(15);
  const [minRating, setMinRating] = useState('');
  const [priceTier, setPriceTier] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [openNow, setOpenNow] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedBusinessOnMap, setSelectedBusinessOnMap] = useState(null);

  // Leaflet map reference
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Load businesses with applied filters
  useEffect(() => {
    loadBusinesses();
  }, [
    selectedCategory, 
    radius, 
    minRating, 
    priceTier, 
    verifiedOnly, 
    openNow, 
    sortBy, 
    userLocation
  ]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const res = await api.getBusinesses({
        q: searchQuery,
        category: selectedCategory === 'all' ? '' : selectedCategory,
        area: userLocation.area,
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius,
        minRating,
        priceTier: priceTier === 'all' ? '' : priceTier,
        verifiedOnly,
        openNow,
        sort: sortBy
      });
      if (res.data) {
        setBusinesses(res.data);
      }
    } catch (err) {
      console.error('Failed to load businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadBusinesses();
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center map around user location or default Indiranagar
    const centerLat = userLocation.lat || 12.9784;
    const centerLng = userLocation.lng || 77.6408;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([centerLat, centerLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([centerLat, centerLng], 13);
    }

    // Refresh markers
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      // User location marker
      const userMarkerIcon = L.divIcon({
        className: 'user-location-marker',
        html: `<div style="background:#4F46E5; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 12px rgba(79,70,229,0.8);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      L.marker([centerLat, centerLng], { icon: userMarkerIcon })
        .addTo(markersLayerRef.current)
        .bindPopup(`<b>Your Search Location</b><br/>${userLocation.area}`);

      // Add business markers
      businesses.forEach((b) => {
        const markerColor = b.is_verified ? '#10B981' : '#F59E0B';
        const customIcon = L.divIcon({
          className: 'business-marker',
          html: `<div style="background:${markerColor}; color:white; font-size:11px; font-weight:bold; padding:4px 8px; border-radius:12px; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.3); display:flex; align-items:center; gap:3px;">
            <span>★ ${b.rating.toFixed(1)}</span>
          </div>`,
          iconSize: [50, 24],
          iconAnchor: [25, 24]
        });

        const marker = L.marker([b.latitude, b.longitude], { icon: customIcon })
          .addTo(markersLayerRef.current);

        marker.on('click', () => {
          setSelectedBusinessOnMap(b);
        });
      });
    }
  }, [businesses, userLocation]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] max-w-7xl mx-auto w-full overflow-hidden">
      
      {/* Left Column: Search Bar, Filters & Business Grid */}
      <div className="w-full lg:w-7/12 flex flex-col h-full border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        
        {/* Search & Filter Header */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 space-y-3">
          
          <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shops, services, doctors, restaurants..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shrink-0"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                showFilterDrawer || verifiedOnly || openNow || minRating
                  ? 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 text-brand-600'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title="Filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Categories Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full font-medium shrink-0 transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {['Home Services', 'Restaurants & Cafes', 'Healthcare & Dental', 'Salons & Beauty', 'Grocery Stores', 'Electronics & Repairs'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full font-medium shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? 'bg-brand-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Collapsible Filter Tray */}
          {showFilterDrawer && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in text-xs">
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Distance Radius */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Max Radius: <strong className="text-brand-600">{radius} km</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                    className="w-full accent-brand-600 cursor-pointer"
                  />
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Min Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                    className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.0">4.0 ★ & Above</option>
                    <option value="4.5">4.5 ★ & Above</option>
                    <option value="4.8">4.8 ★ & Above</option>
                  </select>
                </div>

                {/* Price Tier */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Price Tier</label>
                  <select
                    value={priceTier}
                    onChange={(e) => setPriceTier(e.target.value)}
                    className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="all">Any Price</option>
                    <option value="₹">₹ (Affordable)</option>
                    <option value="₹₹">₹₹ (Moderate)</option>
                    <option value="₹₹₹">₹₹₹ (Premium)</option>
                  </select>
                </div>

                {/* Sort Option */}
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Highest Rating</option>
                    <option value="distance">Nearest Distance</option>
                    <option value="reviews">Most Reviews</option>
                  </select>
                </div>
              </div>

              {/* Checkbox Toggles */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    🛡️ Verified Businesses Only
                  </span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={openNow}
                    onChange={(e) => setOpenNow(e.target.checked)}
                    className="rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    🕒 Open Now Only
                  </span>
                </label>
              </div>

            </div>
          )}

          {/* Results Summary Counter */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Found <strong>{businesses.length}</strong> matching businesses near {userLocation.area}
            </span>
            <span className="font-medium text-slate-400">
              Radius: {radius} km
            </span>
          </div>
        </div>

        {/* Business Grid Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              Searching verified registry...
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Compass className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                No businesses match your exact filters
              </p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Try widening your search radius or unchecking strict filters like 'Verified Only' or 'Open Now'.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {businesses.map((biz) => (
                <BusinessCard 
                  key={biz.id} 
                  business={biz}
                  onSelect={(b) => {
                    setSelectedBusinessOnMap(b);
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([b.latitude, b.longitude], 15);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Right Column: Interactive OpenStreetMap View */}
      <div className="w-full lg:w-5/12 h-64 lg:h-full relative bg-slate-100 dark:bg-slate-900">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Selected Business Card on Map */}
        {selectedBusinessOnMap && (
          <div className="absolute bottom-4 left-4 right-4 z-20 max-w-sm mx-auto animate-in slide-in-from-bottom-2">
            <BusinessCard 
              business={selectedBusinessOnMap} 
              compact={false}
            />
          </div>
        )}
      </div>

    </div>
  );
}

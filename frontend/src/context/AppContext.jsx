import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('lc_theme') || 'light');

  // User & Role State
  const [currentUser, setCurrentUser] = useState({
    id: 'usr-customer-1',
    email: 'customer@localconnect.com',
    full_name: 'Priya Narayanan',
    role: 'customer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });
  const [currentRole, setCurrentRole] = useState('customer');

  // Active View Tab: 'chat' | 'explore' | 'owner' | 'admin'
  const [activeTab, setActiveTab] = useState('chat');

  // Location State (Default: Indiranagar, Bengaluru)
  const [userLocation, setUserLocation] = useState({
    lat: 12.9784,
    lng: 77.6408,
    area: 'Indiranagar',
    pincode: '560038',
    city: 'Bengaluru',
    isGps: false
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Selected Business for Details Modal
  const [selectedBusinessId, setSelectedBusinessId] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(false);

  // Comparison State
  const [compareList, setCompareList] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Inquiry / Callback Modal State
  const [inquiryBusiness, setInquiryBusiness] = useState(null);

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Favorites
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('lc_favorites') || '[]');
    } catch {
      return [];
    }
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('lc_theme', theme);
  }, [theme]);

  // Sync favorites
  useEffect(() => {
    localStorage.setItem('lc_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Initialize Auth Profile
  useEffect(() => {
    api.getMe()
      .then(res => {
        if (res.user) {
          setCurrentUser(res.user);
          setCurrentRole(res.user.role || 'customer');
        }
      })
      .catch(err => console.log('Backend initializing in dev mode:', err));
  }, []);

  // Role Switcher
  const switchRole = async (newRole) => {
    try {
      const res = await api.switchRole(newRole);
      if (res.user) {
        setCurrentUser(res.user);
        setCurrentRole(res.user.role);
        addToast(`Switched to ${newRole.toUpperCase()} view`, 'success');
        if (newRole === 'owner') setActiveTab('owner');
        else if (newRole === 'admin') setActiveTab('admin');
        else setActiveTab('chat');
      }
    } catch {
      setCurrentRole(newRole);
      if (newRole === 'owner') setActiveTab('owner');
      else if (newRole === 'admin') setActiveTab('admin');
      else setActiveTab('chat');
    }
  };

  // Browser Geolocation
  const requestGpsLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      addToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          area: 'My GPS Location',
          pincode: 'Detected',
          city: 'Local Area',
          isGps: true
        });
        setIsLocating(false);
        addToast(`Location acquired (${latitude.toFixed(3)}, ${longitude.toFixed(3)})`, 'success');
      },
      (err) => {
        setIsLocating(false);
        setLocationError(err.message || 'Location permission denied');
        addToast('Location access denied or unavailable. Using default area.', 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Open Business Details Modal
  const openBusinessDetails = async (bizId) => {
    setSelectedBusinessId(bizId);
    setIsLoadingBusiness(true);
    try {
      const biz = await api.getBusinessById(bizId, userLocation.lat, userLocation.lng);
      setSelectedBusiness(biz);
    } catch (err) {
      console.error('Failed to load business details:', err);
      addToast('Failed to load business details', 'error');
    } finally {
      setIsLoadingBusiness(false);
    }
  };

  const closeBusinessDetails = () => {
    setSelectedBusiness(null);
    setSelectedBusinessId(null);
  };

  // Comparison Handlers
  const addToCompare = (biz) => {
    if (compareList.some(b => b.id === biz.id)) {
      setCompareList(prev => prev.filter(b => b.id !== biz.id));
      addToast(`Removed ${biz.name} from comparison`, 'info');
      return;
    }
    if (compareList.length >= 3) {
      addToast('You can compare a maximum of 3 businesses at a time', 'warning');
      return;
    }
    setCompareList(prev => [...prev, biz]);
    addToast(`Added ${biz.name} to comparison`, 'success');
  };

  const removeFromCompare = (bizId) => {
    setCompareList(prev => prev.filter(b => b.id !== bizId));
  };

  const clearCompare = () => setCompareList([]);

  // Favorites
  const toggleFavorite = (bizId) => {
    setFavorites(prev => {
      const exists = prev.includes(bizId);
      if (exists) {
        addToast('Removed from saved favorites', 'info');
        return prev.filter(id => id !== bizId);
      } else {
        addToast('Saved to your favorites ❤️', 'success');
        return [...prev, bizId];
      }
    });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,
        currentUser,
        currentRole,
        setCurrentUser,
        switchRole,
        activeTab,
        setActiveTab,
        userLocation,
        setUserLocation,
        isLocating,
        locationError,
        requestGpsLocation,
        selectedBusiness,
        selectedBusinessId,
        isLoadingBusiness,
        openBusinessDetails,
        closeBusinessDetails,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompareOpen,
        setIsCompareOpen,
        inquiryBusiness,
        setInquiryBusiness,
        isAuthOpen,
        setIsAuthOpen,
        favorites,
        toggleFavorite,
        toasts,
        addToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

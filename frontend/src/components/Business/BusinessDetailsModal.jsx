import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  MapPin, 
  Phone, 
  Globe, 
  Mail, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Flag, 
  Send, 
  Navigation, 
  Calendar,
  DollarSign,
  ChevronRight,
  Share2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';

export default function BusinessDetailsModal() {
  const { 
    selectedBusiness, 
    closeBusinessDetails, 
    isLoadingBusiness, 
    setInquiryBusiness,
    addToast,
    currentUser,
    currentRole
  } = useApp();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'services' | 'reviews' | 'hours' | 'verification'
  const [reviews, setReviews] = useState([]);
  const [reviewSort, setReviewSort] = useState('newest');
  
  // New Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [newServiceUsed, setNewServiceUsed] = useState('');
  const [isVerifiedTx, setIsVerifiedTx] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Report Review State
  const [reportingReviewId, setReportingReviewId] = useState(null);
  const [reportReason, setReportReason] = useState('');

  // Owner Reply Form
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (selectedBusiness) {
      loadReviews();
    }
  }, [selectedBusiness, reviewSort]);

  const loadReviews = async () => {
    if (!selectedBusiness) return;
    try {
      const res = await api.getReviews(selectedBusiness.id, reviewSort);
      if (res.data) setReviews(res.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  if (!selectedBusiness) return null;

  const b = selectedBusiness;

  const handleDirections = () => {
    const dest = `${b.latitude},${b.longitude}`;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
  };

  const handleCall = () => {
    window.location.href = `tel:${b.phone}`;
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      addToast('Please enter your review feedback', 'warning');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await api.submitReview({
        business_id: b.id,
        user_name: currentUser?.full_name || 'Customer',
        rating: newRating,
        title: newTitle,
        comment: newComment,
        service_used: newServiceUsed || b.services?.[0]?.name || 'General Service',
        is_verified_transaction: isVerifiedTx
      });

      addToast('Review submitted successfully! Thank you for supporting local businesses.', 'success');
      setShowReviewForm(false);
      setNewTitle('');
      setNewComment('');
      loadReviews();
    } catch (err) {
      addToast('Failed to post review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReportReview = async (reviewId) => {
    if (!reportReason.trim()) {
      addToast('Please provide a reason for reporting', 'warning');
      return;
    }

    try {
      await api.reportReview(reviewId, reportReason);
      addToast('Review has been reported to moderation team for investigation.', 'success');
      setReportingReviewId(null);
      setReportReason('');
      loadReviews();
    } catch {
      addToast('Failed to submit report', 'error');
    }
  };

  const handleOwnerReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
      await api.replyToReview(reviewId, replyText);
      addToast('Owner reply published!', 'success');
      setReplyingReviewId(null);
      setReplyText('');
      loadReviews();
    } catch {
      addToast('Failed to post reply', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover Gallery */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-950 shrink-0">
          <img
            src={b.photos?.[0] || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'}
            alt={b.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={closeBusinessDetails}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors backdrop-blur-md"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Overlay Badges & Title */}
          <div className="absolute bottom-4 left-4 right-4 text-white space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              {b.is_verified ? (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Business
                </span>
              ) : (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-semibold shadow-md">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Pending Verification
                </span>
              )}
              <span className="px-3 py-1 rounded-full bg-slate-900/80 text-xs font-medium backdrop-blur-md">
                {b.category} • {b.subcategory}
              </span>
              <span className="px-3 py-1 rounded-full bg-brand-600/90 text-xs font-bold">
                {b.price_tier} ({b.price_range_text})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {b.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold text-white text-base">{b.rating.toFixed(1)}</span>
                <span className="text-slate-300">({b.review_count} verified reviews)</span>
              </div>

              <div className="flex items-center gap-1 text-slate-300">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>{b.area}, {b.city}</span>
                {b.distance_km != null && (
                  <span className="font-semibold text-brand-300 bg-brand-950/60 px-2 py-0.5 rounded-full ml-1">
                    {b.distance_km} km away
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent-400" />
                <span className={b.is_open_now ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
                  {b.hours_status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'services'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Services & Pricing ({b.services?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'verification'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Trust & Credentials
          </button>
          <button
            onClick={() => setActiveTab('hours')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'hours'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Operating Hours
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                  About the Business
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {b.description}
                </p>
              </div>

              {/* Photo Showcase */}
              {b.photos && b.photos.length > 1 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Photo Gallery
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {b.photos.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${b.name} showcase ${idx}`}
                        className="h-28 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 hover:scale-102 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Contact & Location Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Contact Information
                  </h4>
                  <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span className="font-semibold">{b.phone}</span>
                    </div>
                    {b.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span>{b.email}</span>
                      </div>
                    )}
                    {b.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-purple-500" />
                        <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-brand-600 dark:text-brand-400 hover:underline">
                          {b.website.replace('https://', '')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Location & Service Area
                  </h4>
                  <div className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    <p className="font-medium">{b.address}</p>
                    <p className="text-slate-500 dark:text-slate-400">PIN Code: {b.pincode}</p>
                    <p className="text-slate-500 dark:text-slate-400">Coordinates: {b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {b.tags && b.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Features & Highlights
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {b.tags.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 border border-brand-200/60 dark:border-brand-800"
                      >
                        ✓ {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SERVICES & PRICING */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Verified Price Catalog
                </h3>
                <span className="text-xs text-slate-500">
                  Transparent local rates with no hidden charges
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {b.services?.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs space-y-2 hover:border-brand-500 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {srv.name}
                      </h4>
                      <div className="text-right shrink-0">
                        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                          ₹{srv.price}
                        </span>
                        {srv.duration && (
                          <div className="text-[10px] text-slate-400 font-medium">
                            {srv.duration}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {srv.description}
                    </p>

                    <button
                      onClick={() => setInquiryBusiness({ business: b, service: srv })}
                      className="mt-2 w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-brand-600 hover:text-white dark:bg-slate-700 dark:hover:bg-brand-600 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1"
                    >
                      <span>Request Callback for this</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Rating Summary Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
                      {b.rating.toFixed(1)}
                    </span>
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= Math.round(b.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {reviews.length} total reviews
                    </span>
                  </div>

                  <div className="h-12 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-16">5 Stars</span>
                      <div className="w-28 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-amber-400 w-[85%]" />
                      </div>
                      <span className="text-slate-400">85%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-16">4 Stars</span>
                      <div className="w-28 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-amber-400 w-[12%]" />
                      </div>
                      <span className="text-slate-400">12%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-colors"
                >
                  {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                </button>
              </div>

              {/* Review Submission Form */}
              {showReviewForm && (
                <form
                  onSubmit={handleSubmitReview}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-brand-500/40 shadow-lg space-y-4 animate-in fade-in"
                >
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Share your experience with {b.name}
                  </h4>

                  {/* Star Picker */}
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Your Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className="p-1 hover:scale-115 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= newRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-amber-500">
                        {newRating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Review Title</label>
                      <input
                        type="text"
                        placeholder="e.g., Quick and neat repair work"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Service Utilized</label>
                      <input
                        type="text"
                        placeholder="e.g., Ceiling fan repair / Teeth cleaning"
                        value={newServiceUsed}
                        onChange={(e) => setNewServiceUsed(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Detailed Feedback</label>
                    <textarea
                      rows={3}
                      placeholder="Share specifics about timing, punctuality, pricing transparency, and service quality..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="verifiedTx"
                      checked={isVerifiedTx}
                      onChange={(e) => setIsVerifiedTx(e.target.checked)}
                      className="rounded text-brand-600 focus:ring-brand-500"
                    />
                    <label htmlFor="verifiedTx" className="text-xs text-slate-600 dark:text-slate-300">
                      I have an authentic receipt or proof of service with this business (Verified Transaction Badge)
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReviewForm(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      {isSubmittingReview ? 'Publishing...' : 'Publish Review'}
                    </button>
                  </div>
                </form>
              )}

              {/* Sorting Filter */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Community Reviews
                </span>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400">Sort by:</span>
                  <select
                    value={reviewSort}
                    onChange={(e) => setReviewSort(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
                  >
                    <option value="newest">Newest First</option>
                    <option value="highest">Highest Rating</option>
                    <option value="lowest">Lowest Rating</option>
                  </select>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">
                    No customer reviews yet. Be the first to review this business!
                  </p>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={rev.user_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={rev.user_name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                {rev.user_name}
                              </span>
                              {rev.is_verified_transaction && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Verified Transaction
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Used: {rev.service_used || 'Standard Service'} • {new Date(rev.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Stars & Report */}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300 dark:text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                          <button
                            onClick={() => setReportingReviewId(rev.id)}
                            className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                            title="Report review"
                          >
                            <Flag className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {rev.title && (
                        <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {rev.title}
                        </h5>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rev.comment}
                      </p>

                      {/* Owner Reply */}
                      {rev.owner_reply && (
                        <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border-l-3 border-brand-500 text-xs space-y-1">
                          <span className="font-bold text-brand-600 dark:text-brand-400 block text-[11px]">
                            Response from Business Owner:
                          </span>
                          <p className="text-slate-600 dark:text-slate-300 italic">
                            "{rev.owner_reply.reply_text}"
                          </p>
                        </div>
                      )}

                      {/* Owner reply action (shown for business owner role) */}
                      {currentRole === 'owner' && !rev.owner_reply && (
                        <div className="pt-1">
                          {replyingReviewId === rev.id ? (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="text"
                                placeholder="Write official owner response..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none"
                              />
                              <button
                                onClick={() => handleOwnerReply(rev.id)}
                                className="px-3 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg"
                              >
                                Reply
                              </button>
                              <button
                                onClick={() => setReplyingReviewId(null)}
                                className="text-xs text-slate-400"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReplyingReviewId(rev.id)}
                              className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                            >
                              + Post Owner Response
                            </button>
                          )}
                        </div>
                      )}

                      {/* Reporting Modal Drawer inline */}
                      {reportingReviewId === rev.id && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl space-y-2 mt-2">
                          <span className="text-xs font-bold text-rose-700 dark:text-rose-400">
                            Report suspicious or abusive review
                          </span>
                          <input
                            type="text"
                            placeholder="Reason (e.g., spam, fake review, competitor harassment)..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 focus:outline-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setReportingReviewId(null)}
                              className="text-xs text-slate-500"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReportReview(rev.id)}
                              className="px-3 py-1 bg-rose-600 text-white text-xs font-semibold rounded-lg"
                            >
                              Submit Report
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TRUST & CREDENTIALS */}
          {activeTab === 'verification' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  {b.is_verified ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Verification Audit Record
                  </h4>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {b.verification_badge_text || 'Pending formal documentation submission and verification audit.'}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Verification Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {b.verification_date ? new Date(b.verification_date).toLocaleDateString() : 'Under Review'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Trust Badge Status</span>
                    <span className={`font-semibold ${b.is_verified ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {b.is_verified ? 'Tier-1 Verified Partner' : 'Standard Unverified Profile'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-brand-50/60 dark:bg-brand-950/20 border border-brand-200/60 dark:border-brand-900/40 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <span className="font-bold text-brand-700 dark:text-brand-300 block">
                  LocalConnect Verification Policy:
                </span>
                <p>
                  Every verified badge on LocalConnect is backed by physical or digital verification of govt trade licenses, GST registration, or statutory certifications. We do not accept sponsored placements.
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: OPERATING HOURS */}
          {activeTab === 'hours' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Schedule</span>
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Current: {b.hours_status}</span>
                </div>

                <div className="space-y-2 text-xs">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                    const sched = b.opening_hours?.[day];
                    const isClosed = !sched || sched.closed;
                    return (
                      <div key={day} className="flex items-center justify-between py-1 capitalize">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{day}</span>
                        <span className={isClosed ? 'text-rose-500 font-medium' : 'text-slate-600 dark:text-slate-400 font-mono'}>
                          {isClosed ? 'Closed' : `${sched.open || '09:00'} - ${sched.close || '21:00'}`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Sticky Bottom Action Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDirections}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Get Directions</span>
            </button>

            <button
              onClick={handleCall}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-xs font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call ({b.phone})</span>
            </button>
          </div>

          <button
            onClick={() => setInquiryBusiness({ business: b })}
            className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition-all hover:scale-102"
          >
            Request Callback / Booking
          </button>
        </div>

      </div>
    </div>
  );
}

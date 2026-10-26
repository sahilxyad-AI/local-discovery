import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ExternalLink, 
  Flag, 
  Trash2, 
  TrendingUp, 
  Users, 
  Store, 
  MessageSquare,
  Clock,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useApp } from '../../context/AppContext';

export default function AdminPortal() {
  const { addToast } = useApp();

  const [stats, setStats] = useState(null);
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [activeAdminTab, setActiveAdminTab] = useState('verification'); // 'verification' | 'moderation'
  const [rejectionReasonPrompt, setRejectionReasonPrompt] = useState(null);
  const [rejectionReasonText, setRejectionReasonText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, vRes, fRes] = await Promise.all([
        api.getAdminStats(),
        api.getVerificationRequests(),
        api.getFlaggedReviews()
      ]);
      setStats(statsRes);
      if (vRes.data) setVerificationRequests(vRes.data);
      if (fRes.data) setFlaggedReviews(fRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVerification = async (reqId) => {
    try {
      await api.reviewVerification(reqId, 'approved', 'Sarah Jenkins (Admin)');
      addToast('Verification approved! Verified badge activated for business.', 'success');
      loadAdminData();
    } catch {
      addToast('Failed to approve verification', 'error');
    }
  };

  const handleRejectVerification = async (reqId) => {
    if (!rejectionReasonText.trim()) {
      addToast('Please enter a rejection reason', 'warning');
      return;
    }
    try {
      await api.reviewVerification(reqId, 'rejected', 'Sarah Jenkins (Admin)', rejectionReasonText);
      addToast('Verification request marked as rejected', 'info');
      setRejectionReasonPrompt(null);
      setRejectionReasonText('');
      loadAdminData();
    } catch {
      addToast('Failed to reject verification', 'error');
    }
  };

  const handleReviewModeration = async (reviewId, action) => {
    try {
      await api.moderateReview(reviewId, action);
      addToast(action === 'approve' ? 'Review cleared & approved' : 'Abusive review removed permanently', 'success');
      loadAdminData();
    } catch {
      addToast('Failed to moderate review', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      
      {/* Admin Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-brand-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Trust & Safety Administration
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Compliance & Verification Console
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 max-w-xl mt-1">
            Audit business credentials, manage official verification shields, and investigate reported community reviews.
          </p>
        </div>

        <button
          onClick={loadAdminData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Shops</span>
              <Store className="w-4 h-4 text-brand-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
              {stats.totalBusinesses}
            </div>
            <span className="text-[10px] text-slate-400">Registered across city</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Verified Rate</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.verificationRate}%
            </div>
            <span className="text-[10px] text-slate-400">{stats.verifiedBusinesses} verified entities</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Audit</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-500">
              {verificationRequests.filter(v => v.status === 'pending').length}
            </div>
            <span className="text-[10px] text-slate-400">Awaiting document check</span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-bold uppercase tracking-wider">Flagged Reviews</span>
              <Flag className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-500">
              {flaggedReviews.length}
            </div>
            <span className="text-[10px] text-slate-400">Spam or abusive reports</span>
          </div>
        </div>
      )}

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveAdminTab('verification')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeAdminTab === 'verification'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Verification Queue ({verificationRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveAdminTab('moderation')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeAdminTab === 'moderation'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Review Moderation ({flaggedReviews.length})</span>
        </button>
      </div>

      {/* TAB 1: VERIFICATION REQUESTS */}
      {activeAdminTab === 'verification' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Merchant Verification Requests
            </h2>
            <p className="text-xs text-slate-500">
              Review submitted trade licenses, GST numbers, and establishment certificates
            </p>
          </div>

          <div className="space-y-3">
            {verificationRequests.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">
                No verification requests found.
              </p>
            ) : (
              verificationRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {req.business_name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            req.status === 'approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : req.status === 'rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        Owner: {req.owner_name} ({req.owner_email}) • Submitted {new Date(req.submission_date).toLocaleDateString()}
                      </span>
                    </div>

                    {req.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApproveVerification(req.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve & Verify</span>
                        </button>
                        <button
                          onClick={() => setRejectionReasonPrompt(req.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Document details box */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Document Type</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{req.document_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration / License #</span>
                      <span className="font-mono font-bold text-brand-600 dark:text-brand-400">{req.document_number}</span>
                    </div>
                    {req.notes && (
                      <div className="sm:col-span-2">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Notes</span>
                        <p className="text-slate-600 dark:text-slate-300">{req.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Rejection input prompt */}
                  {rejectionReasonPrompt === req.id && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 space-y-2 animate-in fade-in">
                      <span className="font-bold text-rose-700 dark:text-rose-400 block">
                        Reason for rejection:
                      </span>
                      <input
                        type="text"
                        placeholder="e.g., Incomplete trade license scan, expired validity..."
                        value={rejectionReasonText}
                        onChange={(e) => setRejectionReasonText(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-700 focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRejectionReasonPrompt(null)}
                          className="px-2.5 py-1 text-slate-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRejectVerification(req.id)}
                          className="px-3 py-1 bg-rose-600 text-white font-semibold rounded-lg"
                        >
                          Confirm Rejection
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

      {/* TAB 2: REVIEW MODERATION */}
      {activeAdminTab === 'moderation' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md space-y-4 animate-in fade-in">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Reported Review Moderation
            </h2>
            <p className="text-xs text-slate-500">
              Investigate customer reports of abusive language, competitor spam, or unverified slander
            </p>
          </div>

          <div className="space-y-3">
            {flaggedReviews.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No flagged or reported reviews awaiting moderation. The platform is clean! ✨
              </div>
            ) : (
              flaggedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {rev.user_name}
                      </span>
                      <span className="text-slate-400 text-[10px] ml-2">
                        Rating: {rev.rating} ★ • {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReviewModeration(rev.id, 'approve')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
                      >
                        Keep & Approve
                      </button>
                      <button
                        onClick={() => handleReviewModeration(rev.id, 'remove')}
                        className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Review</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 italic">
                    "{rev.comment}"
                  </p>

                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-[11px] text-rose-700 dark:text-rose-400">
                    <strong>Reported Reason:</strong> {rev.report_reason || 'Flagged for moderation inspection'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}

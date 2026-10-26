// API Service Layer for LocalConnect

const API_BASE = '/api';

export const api = {
  // Authentication & Roles
  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`);
    return res.json();
  },

  async switchRole(role) {
    const res = await fetch(`${API_BASE}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return res.json();
  },

  async login(email, role) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Businesses
  async getBusinesses(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/businesses?${query.toString()}`);
    return res.json();
  },

  async getBusinessById(id, lat = null, lng = null) {
    let url = `${API_BASE}/businesses/${id}`;
    if (lat && lng) url += `?lat=${lat}&lng=${lng}`;
    const res = await fetch(url);
    return res.json();
  },

  async createBusiness(data) {
    const res = await fetch(`${API_BASE}/businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateBusiness(id, data) {
    const res = await fetch(`${API_BASE}/businesses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async sendInquiry(businessId, data) {
    const res = await fetch(`${API_BASE}/businesses/${businessId}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Reviews
  async getReviews(businessId, sort = 'newest') {
    const res = await fetch(`${API_BASE}/reviews/${businessId}?sort=${sort}`);
    return res.json();
  },

  async submitReview(data) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async replyToReview(reviewId, replyText) {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply_text: replyText })
    });
    return res.json();
  },

  async reportReview(reviewId, reason) {
    const res = await fetch(`${API_BASE}/reviews/${reviewId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  // Verification
  async getVerificationRequests(status = null) {
    const url = status ? `${API_BASE}/verification?status=${status}` : `${API_BASE}/verification`;
    const res = await fetch(url);
    return res.json();
  },

  async submitVerification(data) {
    const res = await fetch(`${API_BASE}/verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async reviewVerification(requestId, status, reviewerName, rejectionReason) {
    const res = await fetch(`${API_BASE}/verification/${requestId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        reviewer_name: reviewerName,
        rejection_reason: rejectionReason
      })
    });
    return res.json();
  },

  // Chatbot
  async sendChatMessage(message, userLocation = null, conversationHistory = []) {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        userLocation,
        conversationHistory
      })
    });
    return res.json();
  },

  async getQuickPrompts() {
    const res = await fetch(`${API_BASE}/chat/quick-prompts`);
    return res.json();
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`);
    return res.json();
  },

  async getFlaggedReviews() {
    const res = await fetch(`${API_BASE}/admin/flagged-reviews`);
    return res.json();
  },

  async moderateReview(reviewId, action) {
    const res = await fetch(`${API_BASE}/admin/reviews/${reviewId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    return res.json();
  }
};

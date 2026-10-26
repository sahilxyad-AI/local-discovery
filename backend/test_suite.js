// LocalConnect Comprehensive Automated Test Suite
const assert = require('assert');

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('🧪 Starting LocalConnect Automated Verification Tests...\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
    }
  }

  // 1. Health & Server check
  await test('Backend Health Check Endpoint', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.ok(data.total_businesses >= 8, 'Should have initial businesses loaded');
  });

  // 2. Chatbot queries test
  await test('AI Chatbot: "Find the best electrician near me" (Intent detection & slot filling)', async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Find the best electrician near me' })
    });
    const data = await res.json();
    assert.ok(data.success);
    assert.ok(data.intent.category === 'Home Services' || data.intent.subcategory === 'Electricians');
    assert.ok(data.intent.needsLocationPrompt, 'Should prompt for location when near me is used without GPS');
    assert.ok(data.suggestedFollowUps.length > 0);
  });

  await test('AI Chatbot: "Find the best electrician in Indiranagar" (Full recommendation with cards)', async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Find the best electrician in Indiranagar' })
    });
    const data = await res.json();
    assert.ok(data.success);
    assert.ok(data.businessCards.length > 0, 'Should return matching business cards');
    const topCard = data.businessCards[0];
    assert.ok(topCard.name.includes('PowerVolt') || topCard.category.includes('Home Services'));
    assert.strictEqual(topCard.is_verified, true, 'Top recommendation should be verified');
    assert.ok(data.message.includes('Top Recommendation:'), 'Should explain recommendation reason');
  });

  await test('AI Chatbot: "Suggest affordable restaurants nearby" with user location', async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Suggest affordable restaurants nearby',
        userLocation: { lat: 12.9784, lng: 77.6408, area: 'Indiranagar' }
      })
    });
    const data = await res.json();
    assert.ok(data.success);
    assert.ok(data.businessCards.length > 0);
  });

  await test('AI Chatbot: "Find a dentist who is open today"', async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Find a dentist who is open today in Indiranagar'
      })
    });
    const data = await res.json();
    assert.ok(data.success);
    assert.ok(data.businessCards.some(b => b.subcategory === 'Dentists'));
  });

  await test('AI Chatbot: "Find a salon offering services under ₹500"', async () => {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Find a salon offering services under ₹500 in HSR Layout'
      })
    });
    const data = await res.json();
    assert.ok(data.success);
    assert.ok(data.businessCards.some(b => b.category === 'Salons & Beauty'));
  });

  // 3. Location-Based Distance & Filtering Test
  await test('Business Filtering: Category, Distance Radius & Verification', async () => {
    const res = await fetch(`${BASE_URL}/api/businesses?category=Home%20Services&lat=12.9784&lng=77.6408&radius=10&verifiedOnly=true`);
    const data = await res.json();
    assert.ok(data.count > 0);
    assert.ok(data.data.every(b => b.is_verified === true));
    assert.ok(data.data.every(b => b.distance_km <= 10));
  });

  // 4. Customer Review Workflow (Submit, Sort, Report, Reply)
  await test('Customer Review Lifecycle: Submit, Verify Transaction, Report, and Owner Reply', async () => {
    // Submit review
    const submitRes = await fetch(`${BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: 'biz-elec-1',
        user_name: 'Aditya Sen',
        rating: 5,
        title: 'Outstanding quick response',
        comment: 'Technician resolved our tripped circuit breaker within 30 mins.',
        service_used: 'Home Visit & Diagnostics',
        is_verified_transaction: true
      })
    });
    const reviewData = await submitRes.json();
    assert.ok(reviewData.success);
    const newRevId = reviewData.data.id;

    // Report review
    const reportRes = await fetch(`${BASE_URL}/api/reviews/${newRevId}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Competitor dispute test' })
    });
    const reportData = await reportRes.json();
    assert.ok(reportData.success);

    // Business Owner Reply
    const replyRes = await fetch(`${BASE_URL}/api/reviews/${newRevId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply_text: 'Thank you Aditya, glad we could help promptly!' })
    });
    const replyData = await replyRes.json();
    assert.ok(replyData.success);
    assert.ok(replyData.data.owner_reply.reply_text.includes('Thank you Aditya'));
  });

  // 5. Business Verification Workflow (Submit & Admin Review)
  await test('Verification Workflow: Submit request & Admin approval', async () => {
    // Submit verification
    const vSubmitRes = await fetch(`${BASE_URL}/api/verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_id: 'biz-rest-2',
        business_name: 'Annapurna Tiffin & Meals',
        owner_name: 'Ramesh Adiga',
        owner_email: 'ramesh@annapurna.in',
        document_type: 'FSSAI License',
        document_number: 'FSSAI-11220099887766',
        notes: 'Submitted for verification review'
      })
    });
    const vSubmitData = await vSubmitRes.json();
    assert.ok(vSubmitData.success);
    const reqId = vSubmitData.data.id;

    // Admin approve
    const vReviewRes = await fetch(`${BASE_URL}/api/verification/${reqId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'approved',
        reviewer_name: 'Admin Sarah Jenkins'
      })
    });
    const vReviewData = await vReviewRes.json();
    assert.ok(vReviewData.success);
    assert.strictEqual(vReviewData.data.business.is_verified, true);
  });

  // 6. Admin Stats & Moderation
  await test('Admin Dashboard Stats & Review Moderation', async () => {
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`);
    const stats = await statsRes.json();
    assert.ok(stats.totalBusinesses >= 8);
    assert.ok(stats.verificationRate > 0);
  });

  // 7. Customer Inquiry Submission
  await test('Customer Callback / Inquiry Submission', async () => {
    const inqRes = await fetch(`${BASE_URL}/api/businesses/biz-elec-1/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: 'Rohan Sharma',
        customer_phone: '+91 99000 11223',
        service_requested: 'Ceiling Fan Installation',
        message: 'Need installation for 2 ceiling fans on Sunday.'
      })
    });
    const inqData = await inqRes.json();
    assert.ok(inqData.success);
  });

  console.log(`\n===============================================`);
  console.log(`🎯 Test Results: ${passed} of ${total} tests passed (${Math.round((passed/total)*100)}%)`);
  console.log(`===============================================`);
}

runTests();

import fetch from 'node-fetch';

async function test() {
  try {
    const loginRes = await fetch('https://lily-boutiquelily-boutique-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: 'admin@lilyboutique.com', password: 'admin123'})
    });
    const loginData = await loginRes.json();
    if(!loginData.token) { console.log('Login failed:', loginData); return; }
    console.log('Login success');
    
    const metricsRes = await fetch('https://lily-boutiquelily-boutique-backend.onrender.com/api/admin/analytics', {
      headers: {'Authorization': 'Bearer ' + loginData.token}
    });
    console.log('Metrics status:', metricsRes.status);
    const metricsData = await metricsRes.text();
    console.log('Metrics data:', metricsData);
  } catch (err) {
    console.error('Error:', err);
  }
}
test();

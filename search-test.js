import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  scenarios: {
    constant_typing: {
      executor: 'constant-vus',
      vus: 50000,  // Start with 50 users
      duration: '1m',  // 1 minute test
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% under 3 seconds
    http_req_failed: ['rate<0.1'],     // Less than 10% errors
  },
};

// Search terms for your products
const searchWords = ['p80', 'glock', 'frame', 'pistol', 'kit', 'polymer', 'build', 'ar15', '9mm', '45'];

export default function () {
  const baseUrl = 'https://polymer80.us.com';
  const userId = __VU;
  
  // Simulate typing - each user types a word character by character
  const word = searchWords[userId % searchWords.length];
  const typedLength = (userId % word.length) + 1; // Different typing positions
  const searchTerm = word.substring(0, typedLength);
  
  // Flatsome theme AJAX search endpoint
  const searchUrl = `${baseUrl}/wp-admin/admin-ajax.php`;
  const params = `action=flatsome_ajax_search_products&query=${searchTerm}`;
  
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': `${baseUrl}/ds/autocomps`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json, text/javascript, */*; q=0.01'
  };
  
  const response = http.post(searchUrl, params, { headers: headers });
  
  // Check if the request was successful
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time reasonable': (r) => r.timings.duration < 5000,
    'returns valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    }
  });
  
  // Log some responses for monitoring
  if (userId <= 3) {
    console.log(`User ${userId}: Search "${searchTerm}" -> Status: ${response.status}, Time: ${response.timings.duration}ms`);
  }
  
  sleep(1); // 1 second between keystrokes
}


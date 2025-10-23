import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  scenarios: {
    constant_typing: {
      executor: 'constant-vus',
      vus: 100,  // Start with 100 users (we'll increase later)
      duration: '2m',  // 2 minutes test
    },
  },
};

const searchWords = ['polymer', 'glock', 'p80', 'frame', 'pistol'];

export default function () {
  const userId = __VU;
  const baseUrl = 'https://polymer80.us.com';
  
  // Each user types a random word character by character
  const word = searchWords[userId % searchWords.length];
  const position = Math.floor(Math.random() * word.length) + 1;
  const searchTerm = word.substring(0, position);
  
  // Try the most common FiboSearch endpoint
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-Requested-With': 'XMLHttpRequest',
    'Referer': `${baseUrl}/ds/autocomps`,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  };
  
  const response = http.post(
    `${baseUrl}/wp-admin/admin-ajax.php`,
    `action=dgwt_wcas_ajax_search&term=${searchTerm}`,
    { headers: headers }
  );
  
  sleep(1); // 1 second between keystrokes
}
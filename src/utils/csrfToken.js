// A simple CSRF token utility for improved security
export function generateCSRFToken() {
  // Create a random token
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Store token in sessionStorage
export function storeCSRFToken(token) {
  sessionStorage.setItem('csrfToken', token);
}

// Get token from sessionStorage
export function getCSRFToken() {
  let token = sessionStorage.getItem('csrfToken');
  if (!token) {
    token = generateCSRFToken();
    storeCSRFToken(token);
  }
  return token;
}
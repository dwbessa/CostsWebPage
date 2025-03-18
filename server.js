const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const path = require('path');
const url = require('url');

// Set security headers
server.use((req, res, next) => {
  // Security headers to prevent various attacks
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.header('Content-Security-Policy', "default-src 'self'");
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');
  res.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// Setup CORS properly
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Patching Express redirect vulnerability
server.use((req, res, next) => {
  // Store the original redirect method
  const originalRedirect = res.redirect;
  
  // Override the redirect method with our secured version
  res.redirect = function (url) {
    // Validate URL to ensure it's not an open redirect vulnerability
    // Only allow relative URLs or URLs to our own domain
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Relative URL is fine
      return originalRedirect.call(this, url);
    }
    
    // For absolute URLs, only allow those to our own domains
    try {
      const parsedUrl = new URL(url);
      const allowedHosts = ['localhost:3000', 'localhost:5000']; // Add your allowed domains
      
      if (!allowedHosts.includes(parsedUrl.host)) {
        console.error(`Blocked redirect to disallowed host: ${parsedUrl.host}`);
        return res.status(400).send('Invalid redirect');
      }
    } catch (e) {
      return res.status(400).send('Invalid URL');
    }
    
    return originalRedirect.call(this, url);
  };
  
  next();
});

// URL validation middleware to prevent path traversal
server.use((req, res, next) => {
  // Validate and sanitize URL parameters
  if (req.url.includes('..') || req.url.includes('./') || req.url.includes('//')) {
    return res.status(400).json({ error: 'Invalid URL path detected' });
  }
  
  // Ensure the URL is properly encoded
  const decodedUrl = decodeURIComponent(req.url);
  if (decodedUrl !== req.url && decodedUrl.includes('%')) {
    return res.status(400).json({ error: 'Invalid URL encoding detected' });
  }
  
  next();
});

server.use(middlewares);

// Add request validation middleware
server.use(jsonServer.bodyParser);
server.use((req, res, next) => {
  // Validate all incoming requests
  if (req.method === 'POST' || req.method === 'PATCH') {
    // Input sanitization for projects
    if (req.path.includes('/projects')) {
      // Validate required fields and types
      if (!req.body.name || typeof req.body.name !== 'string') {
        return res.status(400).json({ error: 'Invalid project name' });
      }
      
      if (req.body.budget && (isNaN(req.body.budget) || parseFloat(req.body.budget) < 0)) {
        return res.status(400).json({ error: 'Budget must be a positive number' });
      }
      
      // Sanitize text inputs
      if (req.body.name) {
        req.body.name = req.body.name.replace(/<[^>]*>?/gm, '');
      }
      
      // Sanitize services if present
      if (req.body.services && Array.isArray(req.body.services)) {
        req.body.services = req.body.services.map(service => {
          if (service.name) {
            service.name = service.name.replace(/<[^>]*>?/gm, '');
          }
          if (service.description) {
            service.description = service.description.replace(/<[^>]*>?/gm, '');
          }
          return service;
        });
      }
    }
  }

  // Validate URL paths to prevent path traversal
  const normalizedPath = path.normalize(req.path);
  if (req.path !== normalizedPath) {
    return res.status(400).json({ error: 'Invalid URL path' });
  }
  
  next();
});

// Simple request counting for basic rate limiting
const requestCounts = {};

// Add rate limiting
server.use((req, res, next) => {
  const requestIp = req.ip || req.headers['x-forwarded-for'];
  const now = Date.now();
  const requests = requestCounts[requestIp] || [];
  
  // Clean up old requests (older than 1 minute)
  const validRequests = requests.filter(time => now - time < 60000);
  requestCounts[requestIp] = validRequests;
  
  if (validRequests.length >= 100) { // Max 100 requests per minute
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }
  
  requestCounts[requestIp].push(now);
  next();
});

// Add logging
server.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

server.use(router);

// Error handling middleware - should be last
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

server.listen(5000, () => {
  console.log('JSON Server is running with enhanced security on port 5000');
});
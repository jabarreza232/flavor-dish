module.exports = (req, res, next) => {
  // Enable CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  // JWT Token verification middleware
  if (req.method !== 'POST' || (req.path !== '/auth/login' && req.path !== '/auth/refresh')) {
    const token = req.get('Authorization')?.replace('Bearer ', '');
    
    // Mock token validation - skip for login/refresh
    if (req.path.includes('/auth')) {
      return next();
    }

    // For other protected routes, just log the token
    if (token) {
      console.log('✓ Valid token detected:', token.substring(0, 20) + '...');
    }
  }

  // Add response delay to simulate network latency
  setTimeout(() => next(), Math.random() * 300); // Random delay 0-300ms
};

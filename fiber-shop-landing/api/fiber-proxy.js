/**
 * Fiber API Proxy - Serverless function to bypass CORS restrictions
 * 
 * Temporary workaround while Fiber updates their CORS headers
 * to include https://openshop-ten.vercel.app
 * 
 * Once Fiber fixes CORS, this can be removed and frontend
 * can call Fiber API directly.
 */

const FIBER_API = 'https://api.staging.fiber.shop/v1';

export default async function handler(req, res) {
  // Enable CORS on this route
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method = 'GET', endpoint, body, queryParams } = req.body;

  if (!endpoint) {
    return res.status(400).json({ error: 'endpoint parameter required' });
  }

  try {
    // Build full URL
    let url = `${FIBER_API}/${endpoint}`;
    
    // Add query parameters if provided
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const options = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Add body for POST/PUT/PATCH requests
    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      options.body = JSON.stringify(body);
    }

    // Call Fiber API
    const fiberResponse = await fetch(url, options);
    const data = await fiberResponse.json();

    // Return response with same status
    return res.status(fiberResponse.status).json(data);
  } catch (error) {
    console.error('Fiber proxy error:', error);
    return res.status(500).json({
      error: 'Failed to reach Fiber API',
      message: error.message
    });
  }
}

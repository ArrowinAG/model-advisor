const https = require('https');

// Helper function to make HTTPS requests
function makeHttpsRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';
      
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${e.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Call Groq API
async function callGroqAPI(prompt) {
  const groqApiKey = process.env.GROQ_API_KEY;
  
  if (!groqApiKey) {
    throw new Error('GROQ_API_KEY environment variable not set');
  }

  const requestData = {
    model: 'mixtral-8x7b-32768',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 1500,
    temperature: 0.7
  };

  const options = {
    hostname: 'api.groq.com',
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqApiKey}`,
      'Content-Type': 'application/json'
    }
  };

  try {
    const response = await makeHttpsRequest(options, requestData);
    
    if (response.choices && response.choices[0] && response.choices[0].message) {
      return response.choices[0].message.content;
    } else {
      throw new Error('Unexpected response format from Groq API');
    }
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
}

// Generate recommendations
async function generateRecommendations(useCase, description, volume, budget, priorities) {
  const researchPrompt = `Find the best AI models for this use case:
    
USE CASE: ${useCase}
DESCRIPTION: ${description || 'General'}
VOLUME: ${volume}
BUDGET: ${budget}
PRIORITIES: ${priorities || 'None specified'}

Please provide:
1. Top 5-10 recommended AI models
2. For each model: name, provider, cost per 1M tokens, key strengths
3. Free options available
4. Cost breakdowns for light/medium/heavy usage
5. Final recommendation with reasoning

Be unbiased and practical.`;

  const recommendations = await callGroqAPI(researchPrompt);
  return recommendations;
}

// Estimate costs
function estimateCosts(volume) {
  const costs = {
    light: { light: 'Free', medium: '$5-20', heavy: '$50-200' },
    medium: { light: '$10-30', medium: '$50-150', heavy: '$500-2000' },
    heavy: { light: '$50-100', medium: '$500-1500', heavy: '$2000-5000' }
  };
  
  return costs[volume] || costs.medium;
}

// CORS response helper
function corsResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  };
}

// Main handler
exports.handler = async (event, context) => {
  console.log('Event:', event);

  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return corsResponse(200, { message: 'OK' });
  }

  // Health check endpoint
  if (event.path === '/api/health' && event.httpMethod === 'GET') {
    return corsResponse(200, {
      status: 'healthy',
      cost: '$0 - Free forever!',
      timestamp: new Date().toISOString()
    });
  }

  // Main recommendation endpoint
  if (event.path === '/api/recommend' && event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');

      // Validate required fields
      if (!body.use_case || !body.volume || !body.budget) {
        return corsResponse(400, {
          status: 'error',
          error: 'Missing required fields: use_case, volume, budget'
        });
      }

      console.log('Processing recommendation for:', body.use_case);

      // Generate recommendations
      const recommendations = await generateRecommendations(
        body.use_case,
        body.description || '',
        body.volume,
        body.budget,
        body.priorities || ''
      );

      return corsResponse(200, {
        status: 'success',
        recommendations: recommendations,
        cost_estimate: estimateCosts(body.volume),
        sources: {
          ai: 'Groq (Free Tier)',
          budget: '$0 forever!'
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error processing recommendation:', error);
      
      return corsResponse(500, {
        status: 'error',
        error: error.message || 'Failed to generate recommendations',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // 404 for unknown routes
  return corsResponse(404, {
    status: 'error',
    error: 'Not found',
    path: event.path
  });
};

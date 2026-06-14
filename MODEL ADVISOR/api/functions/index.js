const https = require('https');

function makeHttpsRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          reject(new Error(`Failed to parse: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function callGroqAPI(prompt) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) throw new Error('GROQ_API_KEY not set');

  const requestData = {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
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

  const response = await makeHttpsRequest(options, requestData);
  if (response.choices?.[0]?.message) {
    return response.choices[0].message.content;
  }
  throw new Error('Unexpected API response');
}

async function generateRecommendations(useCase, description, volume, budget, priorities) {
  const prompt = `Find the best AI models for this use case:

USE CASE: ${useCase}
DESCRIPTION: ${description || 'General'}
VOLUME: ${volume}
BUDGET: ${budget}
PRIORITIES: ${priorities || 'Cost, Performance, Ease of Use'}

Provide:
1. Top 5-10 recommended models with latest release dates
2. For each: name, provider, cost per 1M tokens, key strengths, best use cases
3. Free options available
4. Cost breakdowns for light/medium/heavy usage scenarios
5. Final recommendation with detailed reasoning

Be unbiased, practical, specific about pricing and performance.`;

  return await callGroqAPI(prompt);
}

function estimateCosts(volume) {
  const costs = {
    light: { light: 'Free', medium: '$5-20', heavy: '$50-200' },
    medium: { light: '$10-30', medium: '$50-150', heavy: '$500-2000' },
    heavy: { light: '$50-100', medium: '$500-1500', heavy: '$2000-5000' }
  };
  return costs[volume] || costs.medium;
}

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

exports.handler = async (event, context) => {
  console.log(`[${new Date().toISOString()}] ${event.httpMethod} ${event.path}`);

  if (event.httpMethod === 'OPTIONS') {
    return corsResponse(200, { message: 'OK' });
  }

  if (event.path === '/api/health' && event.httpMethod === 'GET') {
    return corsResponse(200, {
      status: 'healthy',
      cost: '$0 - Free forever!',
      model: 'llama-3.3-70b-versatile',
      timestamp: new Date().toISOString()
    });
  }

  if (event.path === '/api/recommend' && event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');

      if (!body.use_case || !body.volume || !body.budget) {
        return corsResponse(400, {
          status: 'error',
          error: 'Missing required fields: use_case, volume, budget'
        });
      }

      console.log(`Processing recommendation for: ${body.use_case}`);

      const recommendations = await generateRecommendations(
        body.use_case,
        body.description || '',
        body.volume,
        body.budget,
        body.priorities || ''
      );

      return corsResponse(200, {
        status: 'success',
        recommendations,
        cost_estimate: estimateCosts(body.volume),
        sources: {
          ai: 'Groq - llama-3.3-70b-versatile',
          budget: '$0 forever!'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error:', error.message);
      return corsResponse(500, {
        status: 'error',
        error: error.message || 'Failed to generate recommendations'
      });
    }
  }

  return corsResponse(404, {
    status: 'error',
    error: 'Not found',
    path: event.path
  });
};

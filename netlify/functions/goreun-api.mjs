import worker from '../../prototype/worker/index.mjs';

// Read secrets only at function invocation time; never embed them in public files.
export default async function handler(request) {
  return worker.fetch(request, {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL,
  });
}

export const config = {
  path: ['/api/config', '/api/analyze'],
};

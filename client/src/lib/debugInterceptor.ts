// lib/utils/debugInterceptor.ts
export const setupDebugInterceptor = () => {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  window.fetch = async function(...args) {
    const url = args[0];

    // Only intercept API calls
    if (typeof url === 'string' && url.includes('/api/')) {
      console.log('🌐 NETWORK REQUEST:', {
        url,
        method: args[1]?.method || 'GET',
        headers: args[1]?.headers,
        body: args[1]?.body
      });

      const startTime = Date.now();

      try {
        const response = await originalFetch.apply(this, args);
        const endTime = Date.now();

        console.log('🌐 NETWORK RESPONSE:', {
          url,
          status: response.status,
          statusText: response.statusText,
          duration: `${endTime - startTime}ms`,
          headers: Object.fromEntries(response.headers.entries())
        });

        // Clone response to log body without consuming it
        const clonedResponse = response.clone();
        try {
          const data = await clonedResponse.json();
          console.log('🌐 RESPONSE DATA:', data);
        } catch (e) {
          console.log('🌐 RESPONSE: [Non-JSON response]');
        }

        return response;
      } catch (error) {
        console.error('🌐 NETWORK ERROR:', { url, error });
        throw error;
      }
    }

    return originalFetch.apply(this, args);
  };
};

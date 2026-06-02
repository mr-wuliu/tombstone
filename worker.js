export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve static assets from __STATIC_CONTENT KV
    if (env.__STATIC_CONTENT) {
      const asset = env.__STATIC_CONTENT.get(url.pathname === '/' ? '/index.html' : url.pathname);
      if (asset) {
        const contentType = getContentType(url.pathname);
        return new Response(asset, {
          headers: { 'Content-Type': contentType },
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  },
};

function getContentType(pathname) {
  if (pathname === '/' || pathname.endsWith('.html')) return 'text/html; charset=utf-8';
  if (pathname.endsWith('.css')) return 'text/css; charset=utf-8';
  if (pathname.endsWith('.js')) return 'application/javascript; charset=utf-8';
  if (pathname.endsWith('.json')) return 'application/json';
  if (pathname.endsWith('.png')) return 'image/png';
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg';
  if (pathname.endsWith('.svg')) return 'image/svg+xml';
  if (pathname.endsWith('.ico')) return 'image/x-icon';
  return 'text/plain; charset=utf-8';
}

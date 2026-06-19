import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(req: NextRequest) {
  const basicAuth = req.headers.get('authorization');
  const url = req.nextUrl;

  // Only protect the /admin routes
  if (url.pathname.startsWith('/admin')) {
    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // Admin password updated to 7259 as requested
      if (user === 'admin' && pwd === '7259') {
        return NextResponse.next();
      }
    }

    return new NextResponse(
      `<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="refresh" content="0; url=/" />
    <title>Authentication Required</title>
  </head>
  <body>
    <script>window.location.href = "/";</script>
    <p>Authentication required. Redirecting to home...</p>
  </body>
</html>`,
      {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Secure Area"',
          'Content-Type': 'text/html',
        },
      }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

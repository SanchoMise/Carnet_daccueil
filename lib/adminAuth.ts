import { NextRequest } from 'next/server';

export function isAdminRequest(request: NextRequest): boolean {
  const headerKey = request.headers.get('x-admin-key');
  return !!headerKey && headerKey === process.env.ADMIN_KEY;
}

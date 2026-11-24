import { proxyResponse } from '../../../lib/covers/proxy.server';

export const runtime = 'nodejs';
export async function GET(req: Request) { return proxyResponse(req); }

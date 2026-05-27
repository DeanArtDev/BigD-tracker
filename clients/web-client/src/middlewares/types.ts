import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

type ProxyMiddleware = (
  req: NextRequest,
  event: NextFetchEvent,
  res: NextResponse,
) => Promise<NextResponse> | NextResponse;

type ProxyFactory = (next: ProxyMiddleware) => ProxyMiddleware;

export type { ProxyMiddleware, ProxyFactory };

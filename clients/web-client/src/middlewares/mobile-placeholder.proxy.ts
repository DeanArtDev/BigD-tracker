import { NextResponse } from 'next/server';
import { UAParser } from 'ua-parser-js';
import { ProxyFactory } from './helpers';

const mobilePlaceholder: ProxyFactory = (next) => async (req, event, res) => {
  const userAgent = req.headers.get('user-agent') || '';
  const ua = new UAParser(userAgent).getResult();
  const isDesktop = ua.device.type === undefined && !/iPad|Tablet|Mobile/i.test(userAgent);

  if (isDesktop) {
    return next(req, event, res);
  }
  return NextResponse.rewrite(new URL('/mobile', req.url));
};

export { mobilePlaceholder };

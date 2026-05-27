import { ProxyFactory, ProxyMiddleware } from './types';

function chain(factories: ProxyFactory[]): ProxyMiddleware {
  return factories.reduceRight<ProxyMiddleware>(
    (acc, factory) => factory(acc),
    (_req, _event, res) => res,
  );
}

export { chain, type ProxyFactory };

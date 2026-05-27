import '@apollo/client';
import { EndpointKind } from './request-context';

declare module '@apollo/client' {
  interface DefaultContext {
    endpoint: EndpointKind;
  }
}

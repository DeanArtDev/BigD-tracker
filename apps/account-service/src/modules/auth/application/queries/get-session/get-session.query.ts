export class GetSessionQuery {
  constructor(readonly input: { readonly userId: number; readonly userAgent?: string } | { readonly token: string }) {}
}

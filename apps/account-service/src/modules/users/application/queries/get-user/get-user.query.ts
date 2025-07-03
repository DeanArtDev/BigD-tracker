export class GetUserQuery {
  constructor(
    readonly input:
      | { readonly id: number }
      | { readonly email: string }
      | { readonly screenName: string },
  ) {}
}

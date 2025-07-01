export class UserCreatedEvent {
  constructor(public readonly input: { readonly id: number }) {}
}

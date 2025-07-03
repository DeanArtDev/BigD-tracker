export class UserCreatedEvent {
  constructor(
    readonly id: number,
    readonly ip?: string,
    readonly userAgent?: string,
  ) {}
}

export class CreateSessionCommand {
  constructor(
    readonly userId: number,
    readonly ip?: string,
    readonly userAgent?: string,
  ) {}
}

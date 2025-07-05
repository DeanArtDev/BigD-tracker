export class DeleteSessionCommand {
  constructor(
    readonly ownerId: number,
    readonly userAgent?: string,
  ) {}
}

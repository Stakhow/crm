export class Client {
  constructor(
    public readonly id: number,
    public readonly createdAt: string,
    public readonly name: string,
    public readonly phone: string,
  ) {}
}
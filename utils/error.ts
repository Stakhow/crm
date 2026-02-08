export class AppError extends Error {
  protected type: string;
  public message: string;
  protected details: object | null;
  protected date: Date;

  constructor(type: string, message: string, details: object | null = null) {
    super(message);
    this.type = type;
    this.details = details;
    this.date = new Date();
    this.message = message;
  }
}

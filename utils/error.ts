export class AppError extends Error {
  protected type: string;
  public message: string;
  protected details: object | null;
  protected timestamp: number;

  constructor(type: string, message: string, details: object | null = null) {
    super(message);
    this.type = type;
    this.details = details;
    this.timestamp = Date.now();
    this.message = message;
  }
}

export enum ScheduleExceptionType {
  GENERIC,
  CAPTCHA_ERROR,
  NON_RETRIABLE
}

export class ScheduleException extends Error {
  code: ScheduleExceptionType;
  constructor(message: string, code: ScheduleExceptionType) {
    super(message);
    this.code = code;
  }
}
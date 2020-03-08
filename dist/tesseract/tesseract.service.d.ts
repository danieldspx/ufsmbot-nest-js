import { Observable } from 'rxjs';
export declare class TesseractService {
    private downloadCaptchaImage;
    private recognizeCaptcha;
    getCaptchaSchedule(session: string): Observable<string>;
}

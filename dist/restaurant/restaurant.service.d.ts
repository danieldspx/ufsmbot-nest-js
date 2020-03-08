import { Observable } from 'rxjs';
import { StudentWrapper } from 'src/shared/student-wrapper.interface';
import { TesseractService } from 'src/tesseract/tesseract.service';
import { Schedule } from './inferfaces/schedule.interface';
import { RequestService } from './request/request.service';
export declare class RestaurantService {
    private readonly requestService;
    private readonly tesseractService;
    constructor(requestService: RequestService, tesseractService: TesseractService);
    auth(matricula: string, password: string): Observable<string>;
    agendarRefeicao(schedule: Schedule, captcha: string): Observable<Response | never>;
    private hasErrorOnHtml;
    scheduleTheMeal(schedule: Schedule, student: StudentWrapper): Observable<Schedule>;
    logOut(session: string): void;
}

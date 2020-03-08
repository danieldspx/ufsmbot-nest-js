import { Observable } from 'rxjs';
import { RequestConfig } from './request-config.interface';
export declare class RequestService {
    makeRequest(requestConfig: RequestConfig): Observable<Response>;
}

import { Injectable } from '@nestjs/common';
import { RequestInit } from 'node-fetch';
import { from, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { RequestConfig } from './request-config.interface';
const fetch = require('node-fetch');

@Injectable()
export class RequestService {
    makeRequest(requestConfig: RequestConfig): Observable<Response> {
        if (typeof requestConfig.headers === 'undefined') {
            requestConfig.headers = [];
        }
        requestConfig.headers.push(['upgrade-insecure-requests', '1']);
        requestConfig.headers.push([
            'content-type',
            'application/x-www-form-urlencoded',
        ]);
        requestConfig.headers.push(['cache-control', 'max-age=0']);
        requestConfig.headers.push([
            'accept-language',
            'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        ]);
        requestConfig.headers.push([
            'accept',
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
        ]);
        const requestInit: RequestInit = {
            body: requestConfig.body,
            method: 'POST',
            headers: requestConfig.headers
        } as RequestInit;
        
        // RequestInit does not allow those:
        // referrerPolicy: 'no-referrer-when-downgrade',
        // mode: 'cors',
        // credentials: 'include'
        // referrer: requestConfig.referrer

        return from<Promise<Response>>(fetch(requestConfig.url, requestInit)).pipe(take(1));
    }
}

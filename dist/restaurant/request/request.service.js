"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const fetch = require('node-fetch');
let RequestService = class RequestService {
    makeRequest(requestConfig) {
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
        const requestInit = {
            body: requestConfig.body,
            method: 'POST',
            headers: requestConfig.headers
        };
        return rxjs_1.from(fetch(requestConfig.url, requestInit)).pipe(operators_1.take(1), operators_1.mergeMap((response) => {
            if (response.status !== 200) {
                return rxjs_1.throwError(new Error(`Error on the upstream server. ${response.status}: ${response.statusText}`));
            }
            return rxjs_1.of(response);
        }));
    }
};
RequestService = __decorate([
    common_1.Injectable()
], RequestService);
exports.RequestService = RequestService;
//# sourceMappingURL=request.service.js.map
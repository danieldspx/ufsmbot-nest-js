"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const fs = require("fs");
const download = require("image-downloader");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const tesseract_js_1 = require("tesseract.js");
let TesseractService = class TesseractService {
    downloadCaptchaImage(session) {
        const dir = `${__dirname}/temp`;
        const options = {
            url: 'https://portal.ufsm.br/ru/usuario/captcha.html',
            dest: `${__dirname}/temp/${session}.jpg`,
            headers: { 'Cookie': `JSESSIONID=${session};`, 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8' }
        };
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        return rxjs_1.from(download.image(options)).pipe(operators_1.map((response) => response.filename));
    }
    async recognizeCaptcha(filepath) {
        const worker = tesseract_js_1.createWorker({
            langPath: `${__dirname}/../assets`,
            gzip: false,
        });
        await worker.load();
        await worker.loadLanguage('por');
        await worker.initialize('por');
        await worker.setParameters({
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXIZ',
            tessedit_pageseg_mode: "8"
        });
        const result = await worker.recognize(filepath);
        await worker.terminate();
        return result.data.text.replace(/(\r\n|\n|\r)/gm, '');
    }
    getCaptchaSchedule(session) {
        return rxjs_1.defer(() => this.downloadCaptchaImage(session)).pipe(operators_1.mergeMap(filepath => this.recognizeCaptcha(filepath)));
    }
};
TesseractService = __decorate([
    common_1.Injectable()
], TesseractService);
exports.TesseractService = TesseractService;
//# sourceMappingURL=tesseract.service.js.map
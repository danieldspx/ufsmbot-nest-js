import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as download from 'image-downloader';
import { from, interval, Observable, defer } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';
import { createWorker, PSM } from 'tesseract.js';


@Injectable()
export class TesseractService {
    private downloadCaptchaImage(session: string): Observable<string>{
        const dir = `${__dirname}/temp`;
        const options = {
            url: 'https://portal.ufsm.br/ru/usuario/captcha.html',
            dest: `${__dirname}/temp/${session}.jpg`,
            headers: {'Cookie': `JSESSIONID=${session};`, 'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'}
        }

        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }

        return from(download.image(options)).pipe(map((response: any) => response.filename))
    }

    private async recognizeCaptcha(filepath: string): Promise<string>{
        const worker = createWorker({
            langPath: `${__dirname}/../assets`,
            gzip: false,
            // logger: m => console.log(m)
        });

        await worker.load();
        await worker.loadLanguage('por');
        await worker.initialize('por');
        await worker.setParameters({
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            tessedit_pageseg_mode: PSM.SINGLE_WORD
        });
        const result = await worker.recognize(filepath);
        await worker.terminate();
        return result.data.text.replace(/(\r\n|\n|\r)/gm, '');
    }

    getCaptchaSchedule(session: string): Observable<string> {
        return defer(() => this.downloadCaptchaImage(session)).pipe(
            mergeMap(filepath => this.recognizeCaptcha(filepath as string))
        )
    }
}
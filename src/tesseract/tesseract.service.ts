import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as download from 'image-downloader';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { createWorker, PSM } from 'tesseract.js';


@Injectable()
export class TesseractService {
    downloadCaptchaImage(session: string){
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

    recognizeCaptchaSchedule(session: string){
        this.downloadCaptchaImage(session).subscribe(filepath => {
            const worker = createWorker({
                langPath: `${__dirname}/../assets`,
                gzip: false,
                logger: m => console.log(m)
            });

            (async () => {
                await worker.load();
                await worker.loadLanguage('por');
                await worker.initialize('por');
                await worker.setParameters({
                    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRST',
                    tessedit_pageseg_mode: PSM.SINGLE_WORD
                });
                const result = await worker.recognize(filepath);
                console.log(result.data.text, result.data.confidence);
                await worker.terminate();
            })();
        })
    }
}
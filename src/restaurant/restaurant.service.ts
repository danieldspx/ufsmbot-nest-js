import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as queryString from 'querystring';
import { from, Observable, of, throwError } from 'rxjs';
import { map, mapTo, mergeMap } from 'rxjs/operators';
import { StudentWrapper } from 'src/shared/student-wrapper.interface';
import { TesseractService } from 'src/tesseract/tesseract.service';
import { Schedule } from './inferfaces/schedule.interface';
import { RequestConfig } from './request/request-config.interface';
import { RequestService } from './request/request.service';
import fs = require('fs');

@Injectable()
export class RestaurantService {
	constructor(
		private readonly configService: ConfigService,
		private readonly requestService: RequestService,
		private readonly tesseractService: TesseractService
	) { }

	auth(matricula: string, password: string): Observable<string> {
		const data = {
			j_username: matricula,
			j_password: password,
		};
		const requestConfig: RequestConfig = {
			body: queryString.stringify(data),
			referrer: 'https://portal.ufsm.br/ru/index.html',
			url: 'https://portal.ufsm.br/ru/j_security_check'
		};
		return this.requestService.makeRequest(requestConfig)
			.pipe(
				map(response => {
					if (response.url.indexOf('jsessionid') === -1) {
						throwError(`Error on retaurant-auth for user ${data.j_username}`)
					}
					return response.url.split(';')[1].replace('jsessionid=', '')
				}),
			);
	}

	agendarRefeicao(schedule: Schedule, captcha: string): Observable<Response | never> {
		const headers = [['Cookie', `JSESSIONID=${schedule.session}`]];
		let bodyRequest = queryString.stringify({
			'restaurante': schedule.restaurante,
			'periodo.inicio': schedule.dia,
			'periodo.fim': schedule.dia,
			'captcha': captcha,
			'save': ''
		});

		console.log('AGENDAR REFEICAO', captcha);

		if (Array.isArray(schedule.refeicao)) {
			for (const refeicao of schedule.refeicao) {
				bodyRequest += `&tiposRefeicao=${refeicao}`;
			}
		} else {
			bodyRequest += `&tiposRefeicao=${schedule.refeicao}`;
		}

		const requestConfig: RequestConfig = {
			body: bodyRequest,
			headers,
			referrer: 'https://portal.ufsm.br/ru/usuario/agendamento/form.html',
			url: 'https://portal.ufsm.br/ru/usuario/agendamento/form.html'
		};

		return this.requestService.makeRequest(requestConfig).pipe(
			mergeMap(res => {
				if(res.status !== 200) { return throwError('Error on schedule meal'); }

				return from(res.text()).pipe(
					mergeMap(html => {
						if(this.hasErrorOnHtml(html)){
							fs.writeFile('teste.html', html, function(err) {
								if(err) {
									return console.log(err);
								}
								console.log("The file was saved!");
							}); 
							return throwError('Error on Captcha');
						}
						return of(res);
					})
				)
			})
		)
	}

	private hasErrorOnHtml(html: string){
		const captchaReg = new RegExp(/<span class="success pill"/g);
		const innerHTML = html.match(captchaReg);
		return innerHTML === null; // Meaning that we dont have success
	}

	scheduleTheMeal(schedule: Schedule, student: StudentWrapper): Observable<Schedule> {
		console.log('ScheduleTheMeal', schedule.dia)
		return this.tesseractService.getCaptchaSchedule(schedule.session)
			.pipe(
				mergeMap(captcha => this.agendarRefeicao(schedule, captcha)),
				mapTo(schedule)
			)
	}

	logOut(session: string): Observable<Response> {
		const headers = [['Cookie', session]];
		const requestConfig: RequestConfig = {
			headers,
			url: 'https://portal.ufsm.br/ru/logout.html',
			referrer: '',
		}
		return this.requestService.makeRequest(requestConfig);
	}

}

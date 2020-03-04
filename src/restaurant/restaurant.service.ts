import { Injectable } from '@nestjs/common';
import * as queryString from 'querystring';
import { from, Observable, of, throwError } from 'rxjs';
import { mapTo, mergeMap, switchMap } from 'rxjs/operators';
import { StudentWrapper } from 'src/shared/student-wrapper.interface';
import { TesseractService } from 'src/tesseract/tesseract.service';
import { Schedule } from './inferfaces/schedule.interface';
import { RequestConfig } from './request/request-config.interface';
import { RequestService } from './request/request.service';

@Injectable()
export class RestaurantService {
	constructor(
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
				mergeMap(response => {
					if (response.url.indexOf('jsessionid') === -1) {
						return throwError(`Error on restaurant-auth for user ${data.j_username}`)
					}
					return of(response.url.split(';')[1].replace('jsessionid=', ''))
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

		console.log('Agendando Refeição - CAPTCHA: ', captcha);

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
						if(this.hasErrorOnHtml(html)) {
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
		const scheduledAlready = new RegExp(/Já existe um agendamento com estes dados/g);
		const innerHTML = html.match(captchaReg);
		const alreadyExist = html.match(scheduledAlready);;
		if(innerHTML === null && alreadyExist != null) {
			return true;
		}
		return false;
	}

	scheduleTheMeal(schedule: Schedule, student: StudentWrapper): Observable<Schedule> {
		console.log(`Agendando para ${schedule.matricula}: ${schedule.dia}`);
		return this.tesseractService.getCaptchaSchedule(schedule.session)
			.pipe(
				switchMap(captcha => this.agendarRefeicao(schedule, captcha)),
				mapTo(schedule)
			)
	}

	logOut(session: string): void {
		const headers = [['Cookie', session]];
		const requestConfig: RequestConfig = {
			headers,
			url: 'https://portal.ufsm.br/ru/logout.html',
			referrer: '',
		}
		this.requestService.makeRequest(requestConfig).subscribe(
			() => {
				console.log('Sucesso ao fazer logout');
			},
			() => {
				console.log('Erro ao fazer login');
			}
		);
	}

}

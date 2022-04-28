import { Injectable } from '@nestjs/common';
import * as queryString from 'querystring';
import { from, Observable, of, throwError } from 'rxjs';
import { map, mapTo, mergeMap, switchMap } from 'rxjs/operators';
import { ScheduleException, ScheduleExceptionType } from 'src/shared/schedule.exception';
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
			switchMap(res => {
				if(res.status !== 200) {
					throw new ScheduleException('Error on schedule meal', ScheduleExceptionType.GENERIC)
				}

				return from(res.text()).pipe(
					switchMap(html => this.throwIfErrorOnHTML(html)),
					mapTo(res)
				)
			})
		)
	}

	private throwIfErrorOnHTML(html: string){
		const afterDeadline = html.match(/O prazo para este agendamento já está esgotado/g);
		const hasSuccess = html.match(/<span class="success pill"/g);
		const alreadyExist = html.match(/Já existe um agendamento com estes dados/g);
		const errorCaptcha = html.match(/Campo inválido/g);
		
		if (errorCaptcha) {
			throw new ScheduleException('Error on Captcha', ScheduleExceptionType.CAPTCHA_ERROR);
		}

		if (hasSuccess == null || afterDeadline || alreadyExist || errorCaptcha) {
			throw new ScheduleException('Not able to schedule the attempted day', ScheduleExceptionType.NON_RETRIABLE);
		}

		return of(undefined);
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

	getStudentNameAndCourse(matricula: string, session: string) {

		/**
		 * The code below stopped working. A simpler way to get the student info is just
		 * to access the URL https://portal.ufsm.br/ru/usuario/situacao.html get the course
		 * there and the name can be found in the navbar.
		 */

		return of(undefined);

		//It is igly but it is the only way
		const requestConfig: RequestConfig = {
			headers: [['Cookie', session]],
			body: `callCount=1\nnextReverseAjaxIndex=0\nc0-scriptName=usuarioRuCaptchaAjaxService\nc0-methodName=search\nc0-id=0\nc0-param0=number:0\nc0-param1=number:10\nc0-e1=string:${matricula}\nc0-e2=string:CAPTCHA\nc0-e3=null:null\nc0-e4=null:null\nc0-param2=Object_Object:{matricula:reference:c0-e1, captcha:reference:c0-e2, orderBy:reference:c0-e3, orderMode:reference:c0-e4}\nbatchId=2\ninstanceId=0\npage=/ru/usuario/transferencia/credito/form.html\nscriptSessionId=5000E7D9FF69206B62CD4E56F325D285348\n`,
			referrer: 'https://portal.ufsm.br/ru/usuario/transferencia/credito/form.html',
			url: 'https://portal.ufsm.br/ru/dwr/call/plaincall/usuarioRuCaptchaAjaxService.search.dwr',
		};

		return this.requestService.makeRequest(requestConfig).pipe(
			switchMap(async response => {
				const body = await response.text();
				const info = {
					nome: this.getProperty(body, 'nome'),
					curso: this.getProperty(this.getProperty(body, 'unidade', false), 'nome')
				};

				info.nome = this.unscapeUnicode(info.nome);
				info.curso = this.unscapeUnicode(info.curso);

				return info;
			})
		);
	}

	private unscapeUnicode(text){
		return decodeURIComponent(JSON.parse(`"${text}"`));
	}

	private getProperty(data: string, label: string, isString: boolean = true): string{

		const sizeSlice = label.length + 1
		const regExpProp = isString ? `${label}:"(.*?)"` : `${label}:{(.*?)}`
	
		let result = data.match(RegExp(regExpProp))[0].slice(sizeSlice)
	
		if(isString){
			return result.replace(new RegExp('"', 'g'), '')
		}
	
		return result;
	}

}

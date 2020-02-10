import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as queryString from 'querystring';
import { Observable, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { Schedule } from './inferfaces/schedule.interface';
import { RequestConfig } from './request/request-config.interface';
import { RequestService } from './request/request.service';

@Injectable()
export class RestaurantService {
	constructor(private readonly configService: ConfigService, private readonly requestService: RequestService) { }

	auth(): Observable<string> {
		const data = {
			j_username: this.configService.get<string>('MATRICULA'),
			j_password: this.configService.get<string>('PASSWORD'),
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
					return response.url.split(';')[1].replace('jsessionid=', 'JSESSIONID=')
				}),
			);
	}

	agendarRefeicao(schedule: Schedule): Observable<Response> {
		const headers = [['Cookie', schedule.session]];

		let bodyRequest = queryString.stringify({
			'restaurante': schedule.restaurante,
			'periodo.inicio': schedule.dia,
			'periodo.fim': schedule.dia,
			'save': ''
		});

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

		return this.requestService.makeRequest(requestConfig);
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

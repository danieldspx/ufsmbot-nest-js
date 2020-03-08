import { AbstractHttpAdapter } from '@nestjs/core';
import { AngularModuleOptions } from '../interfaces/angular-options.interface';
import { AbstractLoader } from './abstract.loader';
export declare class FastifyLoader extends AbstractLoader {
    register(httpAdapter: AbstractHttpAdapter, options: AngularModuleOptions): void;
}

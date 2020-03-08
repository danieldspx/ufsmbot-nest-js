import { AbstractHttpAdapter } from '@nestjs/core';
import { AngularModuleOptions } from '../interfaces/angular-options.interface';
import { AbstractLoader } from './abstract.loader';
export declare class ExpressLoader extends AbstractLoader {
    register(httpAdapter: AbstractHttpAdapter, options: AngularModuleOptions): void;
}

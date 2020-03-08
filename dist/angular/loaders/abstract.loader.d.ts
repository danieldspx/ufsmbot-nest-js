import { AbstractHttpAdapter } from '@nestjs/core';
import { AngularModuleOptions } from '../interfaces/angular-options.interface';
export declare abstract class AbstractLoader {
    abstract register(httpAdapter: AbstractHttpAdapter, options: AngularModuleOptions): any;
    getIndexFilePath(clientPath: string): string;
}

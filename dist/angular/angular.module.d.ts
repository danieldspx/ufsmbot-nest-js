import { DynamicModule, OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { AngularModuleOptions } from './interfaces/angular-options.interface';
import { AbstractLoader } from './loaders/abstract.loader';
export declare class AngularModule implements OnModuleInit {
    private readonly ngOptions;
    private readonly loader;
    private readonly httpAdapterHost;
    constructor(ngOptions: AngularModuleOptions, loader: AbstractLoader, httpAdapterHost: HttpAdapterHost);
    static forRoot(options?: AngularModuleOptions): DynamicModule;
    onModuleInit(): Promise<void>;
}

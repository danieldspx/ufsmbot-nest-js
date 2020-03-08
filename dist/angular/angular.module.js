"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AngularModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const angular_constants_1 = require("./angular.constants");
const angular_providers_1 = require("./angular.providers");
const abstract_loader_1 = require("./loaders/abstract.loader");
let AngularModule = AngularModule_1 = class AngularModule {
    constructor(ngOptions, loader, httpAdapterHost) {
        this.ngOptions = ngOptions;
        this.loader = loader;
        this.httpAdapterHost = httpAdapterHost;
    }
    static forRoot(options = {}) {
        options.rootPath = options.rootPath || angular_constants_1.DEFAULT_ROOT_PATH;
        options.renderPath = options.renderPath || angular_constants_1.DEFAULT_RENDER_PATH;
        return {
            module: AngularModule_1,
            providers: [
                {
                    provide: angular_constants_1.ANGULAR_MODULE_OPTIONS,
                    useValue: options,
                },
            ],
        };
    }
    async onModuleInit() {
        const httpAdapter = this.httpAdapterHost.httpAdapter;
        this.loader.register(httpAdapter, this.ngOptions);
    }
};
AngularModule = AngularModule_1 = __decorate([
    common_1.Module({
        providers: [...angular_providers_1.angularProviders],
    }),
    __param(0, common_1.Inject(angular_constants_1.ANGULAR_MODULE_OPTIONS)),
    __metadata("design:paramtypes", [Object, abstract_loader_1.AbstractLoader,
        core_1.HttpAdapterHost])
], AngularModule);
exports.AngularModule = AngularModule;
//# sourceMappingURL=angular.module.js.map
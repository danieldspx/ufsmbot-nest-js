export interface AngularModuleOptions {
    rootPath?: string;
    renderPath?: string;
    serveStaticOptions?: {
        cacheControl?: boolean;
        dotfiles?: string;
        etag?: boolean;
        extensions?: string[];
        immutable?: boolean;
        index?: boolean | string | string[];
        lastModified?: boolean;
        maxAge?: number | string;
        redirect?: boolean;
        setHeaders?: (res: any, path: string, stat: any) => any;
    };
}

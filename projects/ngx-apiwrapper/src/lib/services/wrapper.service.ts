import { HttpClient, HttpErrorResponse, HttpEventType, HttpHeaders, HttpParams, HttpStatusCode } from '@angular/common/http';
import { inject, Injectable, isDevMode } from '@angular/core';
import { catchError, map, Observable, Subject, tap, throwError } from 'rxjs';
import { ngxApiWrapperConfig } from '../models';

@Injectable()
export class ApiWrapperService {
    private readonly httpClient: HttpClient = inject(HttpClient);
    private config!: ngxApiWrapperConfig;
    private readonly downloadProgress = new Subject();

    constructor(config: ngxApiWrapperConfig) {
        this.config = config;
    }

    get<T>(path: string, options?: APIOptions): Observable<T> {
        if (options?.logToConsole) {
            console.log('API GET Request:', path);
            console.log('API GET Request Options:', options);
            console.log('API Availability:', this.config.availableApis)
        }
        return this.httpClient
        .get<T>(this.urlBuilder(path, options), this.optionsBuilder(options))
        .pipe(
            tap((result) =>
            isDevMode() || options?.logToConsole
                ? console.log(this.urlBuilder(path, options), result)
                : null
            ),
            catchError(options?.ignoreErrors ? throwError : this.handleError)
        );
    }

    getFile(
        path: string,
        mimeType: string,
        fileName: string,
        autoDownload?: boolean,
        options?: APIOptions
    ) {
        if (options?.logToConsole) {
            console.log('API GET Request:', path);
            console.log('API GET Request Options:', options);
        }
        return this.httpClient
            .get(this.urlBuilder(path, options), {
                headers: this.headersBuilder(options),
                params: this.paramsBuilder(options),
                reportProgress: true,
                observe: 'events',
                responseType: 'blob',
            })
            .pipe(
                tap((result: any) => {
                    if (result.type) {
                        if (result.type === HttpEventType.DownloadProgress) {
                            this.setDownloadingProgress(result.loaded / result.total);
                        }
                        else if (result.type === HttpEventType.Response)
                        {
                            if (autoDownload) {
                                const blob = new Blob([result.body], { type: mimeType });
                                const url =  URL.createObjectURL(blob)
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', fileName);
                                document.body.appendChild(link);
                                link.click();
                            }
                        }
                    }
                    if (isDevMode() || options?.logToConsole) {
                        console.log(path, result);
                    }
                }),
                map((result) => {
                if (result.type) {
                    if (result.type === HttpEventType.Response) {
                    return result.body;
                    }
                }
                }),
                catchError(
                options?.ignoreErrors
                    ? throwError
                    : options?.errorOverride ?? this.handleError
                )
            );
    }

    put<T>(path: string, body: any, options?: APIOptions): Observable<T> {
        if (options?.logToConsole) {
            console.log('API PUT Request:', path);
            console.log('API PUT Request Body:', body);
            console.log('API PUT Request Options:', options);
        }
        return this.httpClient
        .put<T>(this.urlBuilder(path, options), body, this.optionsBuilder(options))
        .pipe(
            tap((result) =>
            isDevMode() || options?.logToConsole
                ? console.log(this.urlBuilder(path, options), result)
                : null
            ),
            catchError(options?.ignoreErrors ? throwError : this.handleError)
        );
    }

    post<T>(path: string, body?: any, options?: APIOptions): Observable<T> {
        if (options?.logToConsole) {
            console.log('API POST Request:', path);
            console.log('API POST Request Body:', body);
            console.log('API POST Request Options:', options);
        }
        return this.httpClient
        .post<T>(this.urlBuilder(path, options), body, this.optionsBuilder(options))
        .pipe(
            tap((result) =>
            isDevMode()|| options?.logToConsole
                ? console.log(this.urlBuilder(path, options), result)
                : null
            ),
            catchError(options?.ignoreErrors ? throwError : this.handleError)
        );
    }

    delete<T>(path: string, options?: APIOptions): Observable<T> {
        if (options?.logToConsole) {
            console.log('API DELETE Request:', path);
            console.log('API DELETE Request Options:', options);
        }
        return this.httpClient
        .delete<T>(this.urlBuilder(path, options), this.optionsBuilder(options))
        .pipe(
            tap((result) =>
            isDevMode() || options?.logToConsole
                ? console.log(this.urlBuilder(path, options), result)
                : null
            ),
            catchError(options?.ignoreErrors ? throwError : this.handleError)
        );
    }

    getDownloadingProgress = () => this.downloadProgress.asObservable();
    setDownloadingProgress = (data: any) => this.downloadProgress.next(data);

    private urlBuilder(path: string, options?: APIOptions) {
        if (options) {
            if (options.overridePath) {
                return path;
            }
        }
        let apiBase = this.config.availableApis[options?.apiName ?? (this.config.defaultApi ?? Object.keys(this.config.availableApis)[0])] 
        return `${this.urlStripper(apiBase)}${path}`;
    }

    private urlStripper(path: string): string {
        if (!path.endsWith('/')) {
        return path + '/';
        }
        return path;
    }

    private optionsBuilder(options?: APIOptions) {
        let optionBuild: {[Key: string]: any;} = {
            headers: this.headersBuilder(options),
            params: this.paramsBuilder(options),
        }
        if (options?.observe) {
            optionBuild = {
                ...optionBuild,
                observe: options.observe
            }
        }
        if (options?.responseType) {
            optionBuild = {
                ...optionBuild,
                responseType: options.responseType
            }
        }
        if (options?.reportProgress) {
            optionBuild = {
                ...optionBuild,
                reportProgress: options.reportProgress
            }
        }
        if (options?.withCredentials) {
            optionBuild = {
                ...optionBuild,
                withCredentials: options.withCredentials
            }
        }
        return optionBuild;
    }

    private headersBuilder(options?: APIOptions): HttpHeaders {
        let headerOptions: HttpHeaders = new HttpHeaders();
        if (this.config.requiredHeaders) {
            const requiredHeaders = Object.keys(this.config.requiredHeaders);
            requiredHeaders.forEach(key => {
                headerOptions.append(key, this.config.availableApis[key])
            })
            
        }
        if (options?.headers) {
            for (let key of Object.keys(options.headers)) {
                const headerValue =
                options.headers instanceof HttpHeaders
                    ? options.headers.get(key)
                    : options.headers[key];
                headerOptions = headerOptions.append(key, headerValue!);
            }
        }
        return headerOptions;
    }

    private paramsBuilder(options?: APIOptions): HttpParams | undefined {
        let paramsOptions: HttpParams = new HttpParams();
        if (options?.params) {
        for (let key of Object.keys(options.params)) {
            const headerValue =
            options.params instanceof HttpParams
                ? options.params.get(key)
                : options.params[key];
            paramsOptions = paramsOptions.append(key, headerValue!.toString());
        }
        }
        return paramsOptions;
    }

    private readonly handleError = (err: HttpErrorResponse) => {
        if (this.config.errorHandler) {
            return this.config.errorHandler(err);
        }
        return throwError(() => new Error(err.message));
    };
}

export interface APIOptions {
    apiName?: string;
    headers?: HttpHeaders | { [header: string]: string | string[] };
    params?:
        | HttpParams
        | {
            [param: string]:
            | string
            | number
            | boolean
            | ReadonlyArray<string | number | boolean>;
        };
    overridePath?: boolean;
    version?: number;
    logToConsole?: boolean;
    ignoreErrors?: boolean;
    withCredentials?: boolean;
    reportProgress?: boolean;
    observe?: 'body' | 'events' | 'response';
    errorOverride?: (err: HttpErrorResponse) => Observable<never>;
    responseType?: 'arraybuffer' | 'blob' | 'text' | 'json';
}

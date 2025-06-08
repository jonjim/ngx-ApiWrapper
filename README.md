# Ngx-Apiwrapper

This project has been put together with the aim of minimising the complexity of building repetitive HttpClient methods.

## Dependencies
* Angular v19+

# Installation 
npm install ngx-apiwrapper

# Configuration

Add the provider to you app.config.ts (assuming you are running in standalone mode)

```typescript
import { provideNgxApiWrapper } from 'ngx-apiwrapper'

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxApiWrapper({
      availableApis: {
        yourApi: 'yourfirstapi.com',
        aws: 'yourAWSApi',
        azure: 'yourAzureApi'
      },
      defaultApi: 'yourApi'
    })
  ]
}
```

Define your service, inject the wrapper, and call the wrapper

```typescript
@Injectable({ providedIn: 'root' })
export class APIService {
    private readonly _wrapperService: ApiWrapperService = inject(ApiWrapperService);

    yourMethod() {
        return this._wrapperService.get('your-endpoint');
    }
}
```

# Usage

The wrapper is designed to wrap up common functionality, and can be used alongside a traditional guard for authorization. 

By defining the api base url in the provider, you only need to pass in the specific endpoint when you make the call to the wrapper service. 

Each method accepts a `path` input, where you define the endpoint and an `options` object allowing you to define additional properties like headers or parameters.

The POST and PUT methods both accept a body input as well. 

## Options

The API Options allow you to pass a number of additional options. 

Alongside this, any required headers defined in the config will be applied by default.

```typescript
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
```
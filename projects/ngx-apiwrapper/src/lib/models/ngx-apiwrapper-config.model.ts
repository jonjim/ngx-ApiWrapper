import { Injectable } from "@angular/core";
import { APIObject } from "./api-object.model";
import { HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable()
export class ngxApiWrapperConfig {
    availableApis: APIObject = {};
    defaultApi?: string;
    requiredHeaders?: HttpHeaders | { [header: string]: string | string[] };
    errorHandler?: (err: HttpErrorResponse) => Observable<never>;
    defaultResponseType?: 'arraybuffer' | 'blob' | 'text' | 'json' = 'json';
}
import { Provider } from "@angular/core";
import { ngxApiWrapperConfig } from "./models";
import { ApiWrapperService } from "./services";

export function provideNgxApiWrapper(config: ngxApiWrapperConfig): Provider[] {
    return [
        [
            { provide: ngxApiWrapperConfig, useValue: config },
            { provide: ApiWrapperService, usValue: config }
        ]
    ]
}
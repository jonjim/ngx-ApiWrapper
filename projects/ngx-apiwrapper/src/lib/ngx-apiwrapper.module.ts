import { ModuleWithProviders, NgModule } from "@angular/core";
import { provideNgxApiWrapper } from "./ngx-apiwrapper.config";
import { ngxApiWrapperConfig } from "./models";
import { provideHttpClient } from "@angular/common/http";

@NgModule({
    imports: [],
    providers: [
        provideHttpClient()
    ]
})
export class ngxApiWrapperModule {
    static forRoot(config: ngxApiWrapperConfig): ModuleWithProviders<ngxApiWrapperModule>{
        return {
            ngModule: ngxApiWrapperModule,
            providers: provideNgxApiWrapper(config)
        }
    }
}
import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { MessageService } from "./message.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor{

    constructor(
        private router: Router,
        private messenger: MessageService
    ){}

    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {
        
        const idToken = localStorage.getItem("id_token");

        if (idToken) {
            const cloned = req.clone({
                headers: req.headers.set("Authorization", idToken)
              }
            );
            req = cloned;
        }

        return next.handle(req).do(
            () => {}, 
            (err) => {
                if (err instanceof HttpErrorResponse ) {
                    //console.log(err)
                    if (err.status === 0) {
                        console.log(err)
                        this.messenger.set(
                        {
                            head: 'Servidor não encontrado',
                            type : 'error',
                            message : 'Não foi possível estabelecer comunicação com o servidor',
                            log : err.message
                        })
                        this.router.navigate(['/error'])
                    } else {
                        console.log(err)
                        this.messenger.set(
                        {
                            head: 'Erro ' + err.status,
                            type:'error',
                            message: err.error.message,
                            log : err.message
                        })
                    }
                }
            });
        }
}

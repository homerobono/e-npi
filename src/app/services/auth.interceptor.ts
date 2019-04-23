import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { MessageService } from "./message.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private messenger: MessageService
    ) { }

    intercept(req: HttpRequest<any>,
        next: HttpHandler): Observable<HttpEvent<any>> {

        const idToken = localStorage.getItem("id_token");

        if (idToken) {
            const cloned = req.clone({
                headers: req.headers.set("Authorization", idToken)
            });
            req = cloned;
        }

        return next.handle(req).do(
            () => {},
            (err) => {
                if (err instanceof HttpErrorResponse) {
                    //console.log(err)
                    if (err.status === 0) {
                        console.log(err)
                        this.messenger.set(
                            {
                                head: 'Servidor não encontrado',
                                type: 'error',
                                message: 'Não foi possível estabelecer comunicação com o servidor',
                                log: err.message
                            })
                        //this.router.navigate(['/error'])
                    } else if (err.status === 401) {
                        console.log('UNAUTHORIZED')
                        let expires = new Date(localStorage.getItem("expires_at"))
                        console.log(localStorage.getItem("expires_at"))
                        console.log(expires)
                        if (expires < new Date()) {
                            console.log('Token expirado!')
                            this.messenger.set({
                                    head: 'Token de sessão expirado',
                                    type: 'error',
                                    message: 'Sua sessão expirou. Faça login novamente para continuar navegando.',
                                    log: err.message
                                })
                        }
                    } else {
                        console.log(err)
                        this.messenger.set(
                            {
                                head: 'Erro ' + err.status,
                                type: 'error',
                                message: err.error.message,
                                log: err.message
                            })
                    }
                }
            });
    }
}

import { HttpInterceptor, HttpHandler, HttpEvent, HttpRequest, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor{

    constructor(
        private router: Router
    ){}

    intercept(req: HttpRequest<any>,
              next: HttpHandler): Observable<HttpEvent<any>> {
        
        console.log('intercepting');
        const idToken = localStorage.getItem("id_token");

        if (idToken) {
            //console.log("Session token: "+idToken);
            const cloned = req.clone({
                headers: req.headers.set("Authorization", idToken)
              }
            );
        
            return next.handle(cloned);
        }

        console.log("No session token defined");
        return next.handle(req);

        /*
        return next.handle(req).do((event: HttpEvent<any>) => {
        
            if (event instanceof HttpResponse ) {
                }
            }, (err: any) => {
                if (err instanceof HttpErrorResponse ) {
                    //if (err.status === 401) {
                        this.router.navigate(['login']);
                    //}
                }
            });
        
        */
        }
}

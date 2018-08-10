import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  head: String = 'Erro genérico: '
  message: String = ' Sua solicitação não pode ser efetuada.'
  
  constructor( private router: Router,
    private route: ActivatedRoute ) { 
    this.head = this.route.snapshot.paramMap.get('type');
    this.message = this.route.snapshot.paramMap.get('message');
  }

  ngOnInit() {
  }

  back(){
    this.router.navigate(['']);
  }

}

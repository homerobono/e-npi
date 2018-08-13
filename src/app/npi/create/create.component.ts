import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { NpiService} from '../../services/npi.service'

import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})

export class CreateComponent implements OnInit {
  
  sendingCreate: Boolean = false;
  createSent: Boolean = false;
  createResponse: String;
  response : { 'type', 'message' }

  createForm : FormGroup;
  departments = [ 'Comercial',
    'Compras',
    'Engenharia de Produção',
    'Engenharia de Processos',
    'Financeiro',
    'P&D',
    'Produção',
    'R.H.' ]

  constructor( fb : FormBuilder,
              private npiService: NpiService,
              private authService: AuthService,
              private router: Router,
              private messenger: MessageService
            ) 
  {
    this.createForm = fb.group({
      'name' : 'Projetaço',
      'entry' : 'pixel',
    })
  }

  ngOnInit() {
  }

  createNpi(npiForm : any): void {
    this.sendingCreate = true
    this.npiService.createNpi(npiForm).
    subscribe(res => {
      this.response = { 'type' : 'success', 'message' : 'NPI cadastrado com sucesso' };
      this.createSent = true;
      this.sendingCreate = false;
      this.clearFields();
    }, err => {
      this.response = { 'type' : 'error', 'message' : err.error.message };
      console.log(this.response);
      this.createSent = false;
      this.sendingCreate = false;
    });
  }

  clearFields(){
    this.createForm.patchValue({
      firstName : null,
      lastName : null,
      email : null,
      phone : null,
      department : 'Comercial',
      newPassword : null,
      confPassword : null,
      level: '0'
    });
    this.createForm.markAsPristine();
    this.createForm.markAsUntouched();
  }
}

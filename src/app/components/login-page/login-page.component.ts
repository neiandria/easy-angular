import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { DataService, Paciente, Medico, Usuario } from './../../services/data-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';

  pacientes: Paciente[] = [];
  medicos: Medico[] = [];
  usuarios: Usuario[] = [];

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Carrega listas para validação de login
    this.dataService.getPacientes().subscribe(p => this.pacientes = p);
    this.dataService.getMedicos().subscribe(m => this.medicos = m);
    this.dataService.getUsuarios().subscribe(u => this.usuarios = u);
  }

  onSubmit(): void {
    // Verifica Paciente
    const paciente = this.pacientes.find(p => p.email === this.email && p.senha === this.password);
    if (paciente) {
      this.router.navigate(['/paciente', paciente.id_paciente]);
      return;
    }

    // Verifica Médico
    const medico = this.medicos.find(m => m.email === this.email && m.senha === this.password);
    if (medico) {
      this.router.navigate(['/medico', medico.id_medico]);
      return;
    }

    // Verifica Recepcionista (usuário comum)
    const usuario = this.usuarios.find(u => u.email === this.email && u.senha === this.password);
    if (usuario) {
      this.router.navigate(['/recepcionista', usuario.id_usuario]);
      return;
    }

    // Se não encontrou, exibe erro
    alert('Email ou senha inválidos.');

    
  }
}

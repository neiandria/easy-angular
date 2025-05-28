import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

// ======= Interfaces =======
export interface Paciente {
  id_paciente: number;
  nome: string;
  data_nascimento: Date;
  CPF: string;
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  email: string;
  senha: string;
  telefone: string;
}

export interface Medico {
  id_medico: number;
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  especialidade: string;
  CRM: string;
  CPF: string;
}

export interface Usuario {
  id_usuario: number;
  nome: string;
  email: string;
  senha: string;
}

export type ConsultaStatus =
  | 'agendada'
  | 'em andamento'
  | 'realizada'
  | 'cancelada';

export interface Consulta {
  id_consulta: number;
  id_paciente: number;
  id_medico: number;
  data_consulta: Date;
  status: ConsultaStatus;
}

export interface Historico {
  id_historicoconsulta: number;
  id_consulta: number;
}

// ======= DataService =======
@Injectable({ providedIn: 'root' })
export class DataService {
  // BehaviorSubjects to hold data in memory
  private pacientes$ = new BehaviorSubject<Paciente[]>([]);
  private medicos$ = new BehaviorSubject<Medico[]>([]);
  private usuarios$ = new BehaviorSubject<Usuario[]>([]);
  private consultas$ = new BehaviorSubject<Consulta[]>([]);
  private historico$ = new BehaviorSubject<Historico[]>([]);

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData() {
    // Predefined Pacientes
    const pacientes: Paciente[] = [
      {
        id_paciente: 1,
        nome: 'João Silva',
        data_nascimento: new Date('1985-06-15'),
        CPF: '123.456.789-00',
        sexo: 'Masculino',
        email: 'joao.silva@example.com',
        senha: 'senha123',
        telefone: '(11) 91234-5678',
      },
      {
        id_paciente: 2,
        nome: 'Maria Oliveira',
        data_nascimento: new Date('1992-11-30'),
        CPF: '987.654.321-00',
        sexo: 'Feminino',
        email: 'maria.oliveira@example.com',
        senha: 'senha456',
        telefone: '(21) 99876-5432',
      },
      {
        id_paciente: 3 ,
        nome: 'Mario Netto',
        data_nascimento: new Date('1992-11-30'),
        CPF: '987.654.321-00',
        sexo: 'Masculino',
        email: 'mario@example.com',
        senha: '123456',
        telefone: '(21) 99876-5432',
      },
    ];

    // Predefined Medicos
    const medicos: Medico[] = [
      {
        id_medico: 1,
        nome: 'Dr. Carlos Pereira',
        email: 'doctor@example.com',
        senha: '123456',
        telefone: '(11) 93456-7890',
        especialidade: 'Clínica Geral',
        CRM: 'SP12345',
        CPF: '111.222.333-44',
      },
      {
        id_medico: 2,
        nome: 'Dra. Ana Costa',
        email: 'ana.costa@clinica.com',
        senha: '123456',
        telefone: '(21) 94567-1234',
        especialidade: 'Pediatria',
        CRM: 'RJ67890',
        CPF: '555.666.777-88',
      },
    ];

    // Predefined Usuarios
    const usuarios: Usuario[] = [
      {
        id_usuario: 1,
        nome: 'Admin',
        email: 'admin@clinica.com',
        senha: 'admin123',
      },
    ];

    // Predefined Consultas
    const consultas: Consulta[] = [
      {
        id_consulta: 1,
        id_paciente: 1,
        id_medico: 1,
        data_consulta: new Date('2025-06-01T10:30:00'),
        status: 'agendada',
      },
      {
        id_consulta: 2,
        id_paciente: 2,
        id_medico: 2,
        data_consulta: new Date('2025-06-02T14:00:00'),
        status: 'agendada',
      },
      {
        id_consulta: 3,
        id_paciente: 3,
        id_medico: 2,
        data_consulta: new Date('2025-06-02T14:00:00'),
        status: 'agendada',
      },
      {
        id_consulta: 4,
        id_paciente: 3,
        id_medico: 2,
        data_consulta: new Date('2025-06-02T14:00:00'),
        status: 'agendada',
      },
      {
        id_consulta: 5,
        id_paciente: 2,
        id_medico: 2,
        data_consulta: new Date('2025-06-02T14:00:00'),
        status: 'agendada',
      },
    ];

    // Predefined Histórico
    const historico: Historico[] = [
      {
        id_historicoconsulta: 1,
        id_consulta: 1,
      },
    ];

    this.pacientes$.next(pacientes);
    this.medicos$.next(medicos);
    this.usuarios$.next(usuarios);
    this.consultas$.next(consultas);
    this.historico$.next(historico);
  }

  // ======= Paciente CRUD =======
  getPacientes(): Observable<Paciente[]> {
    return this.pacientes$.asObservable();
  }

  getPacienteById(id: number): Observable<Paciente | undefined> {
    return of(this.pacientes$.value.find((p) => p.id_paciente === id));
  }

  addPaciente(p: Paciente) {
    const list = [...this.pacientes$.value, p];
    this.pacientes$.next(list);
  }

  // ======= Medico CRUD =======
  getMedicos(): Observable<Medico[]> {
    return this.medicos$.asObservable();
  }

  // ... métodos adicionais para atualização e remoção

  // ======= Outros métodos =======
  getConsultas(): Observable<Consulta[]> {
    return this.consultas$.asObservable();
  }

  getHistorico(): Observable<Historico[]> {
    return this.historico$.asObservable();
  }
  // ======= Usuario CRUD =======
  getUsuarios(): Observable<Usuario[]> {
    return this.usuarios$.asObservable();
  }

  getUsuarioById(id: number): Observable<Usuario | undefined> {
    return of(this.usuarios$.value.find((u) => u.id_usuario === id));
  }

  addUsuario(usuario: Usuario): void {
    const list = [...this.usuarios$.value, usuario];
    this.usuarios$.next(list);
  }

  getMedicoById(id: number): Observable<Medico | null> {
    const medico = this.medicos$.value.find((m) => m.id_medico === id) || null;
    return of(medico);
  }
}

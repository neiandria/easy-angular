/* recepcionista-patient-management.component.ts */
import { Component, OnInit } from '@angular/core';
import { DataService, Paciente, Consulta } from './../../services/data-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-recepcionista-patient-management',
  templateUrl: './receptionist-manager-patients.component.html',
  styleUrls: ['./receptionist-manager-patients.component.css'],
  imports:[CommonModule, FormsModule]
})
export class RecepcionistaPatientManagementComponent implements OnInit {
  pacientes: Paciente[] = [];
  consultas: Consulta[] = [];

  // pesquisa
  searchTerm: string = '';

  showNewForm = false;
  newPaciente: Partial<Paciente> = {};

  showHistoryModal = false;
  historyList: Consulta[] = [];

  constructor(public dataService: DataService) {}

  ngOnInit(): void {
    this.loadPacientes();
    this.loadConsultas();
  }

  loadPacientes() {
    this.dataService.getPacientes().subscribe(ps => this.pacientes = ps);
  }

  loadConsultas() {
    this.dataService.getConsultas().subscribe(cs => this.consultas = cs);
  }

  // Toggle formulário de novo paciente
  toggleNewForm() {
    this.showNewForm = !this.showNewForm;
    if (!this.showNewForm) this.newPaciente = {};
  }

  // Adiciona paciente com senha automática
  addPaciente() {
    const p = this.newPaciente;
    if (p.nome && p.email && p.CPF && p.telefone && p.data_nascimento) {
      const id = Date.now();
      const senhaPadrao = Math.random().toString(36).slice(-8);
      const paciente: Paciente = {
        id_paciente: id,
        nome: p.nome,
        email: p.email,
        CPF: p.CPF,
        telefone: p.telefone,
        data_nascimento: new Date(p.data_nascimento),
        sexo: p.sexo as any || 'Outro',
        senha: senhaPadrao
      };
      this.dataService.addPaciente(paciente);
      alert(`Paciente "${paciente.nome}" adicionado com senha: ${senhaPadrao}`);
      this.toggleNewForm();
      this.loadPacientes();
    } else {
      alert('Preencha todos os campos obrigatórios.');
    }
  }

  // Retorna data da última consulta
  getUltimaConsulta(p: Paciente): Date | null {
    const historico = this.consultas
      .filter(c => c.id_paciente === p.id_paciente)
      .sort((a, b) => new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime());
    return historico.length > 0 ? new Date(historico[0].data_consulta) : null;
  }

  // Filtra pacientes por nome ou CPF
  get filteredPacientes(): Paciente[] {
    const termo = this.searchTerm.trim().toLowerCase();
    if (!termo) return this.pacientes;
    return this.pacientes.filter(p =>
      p.nome.toLowerCase().includes(termo) ||
      p.CPF.includes(termo)
    );
  }

  // Histórico modal
  viewHistory(p: Paciente) {
    this.historyList = this.consultas
      .filter(c => c.id_paciente === p.id_paciente)
      .sort((a, b) => new Date(b.data_consulta).getTime() - new Date(a.data_consulta).getTime());
    this.showHistoryModal = true;
  }

  closeHistory() {
    this.showHistoryModal = false;
    this.historyList = [];
  }
}
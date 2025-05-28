import { Component, OnInit } from '@angular/core';
import {
  DataService,
  Consulta,
  Paciente,
  Medico,
} from '../../services/data-service.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

interface ConsultaExibicao {
  consulta: Consulta;
  paciente: Paciente;
}

@Component({
  selector: 'app-medico-dashboard',
  templateUrl: './doctor-view.component.html',
  styleUrls: ['./doctor-view.component.css'],
  imports: [CommonModule, RouterModule],
  // providers: [providei18nOptions({
  //   locale: 'pt-BR',
  //   timeZone: 'America/Sao_Paulo',})]
})
export class MedicoDashboardComponent implements OnInit {
  medicoId: number = 0;
  todasConsultas: Consulta[] = [];
  pacientesMap: Map<number, Paciente> = new Map();

  consultasHoje: Consulta[] = [];
  consultasAmanha: Consulta[] = [];
  consultasSemana: Consulta[] = [];
  totalPacientes: number = 0;

  consultaMaisProxima: ConsultaExibicao | null = null;
  minhasConsultas: ConsultaExibicao[] = [];

  consultaParaConfirmar: ConsultaExibicao | null = null;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute
  ) {}

  medico: Medico | undefined;
  ngOnInit(): void {
    this.medicoId = Number(this.route.snapshot.paramMap.get('id'));

    // Buscar dados do médico logado
    this.dataService.getMedicos().subscribe((medicos) => {
      this.medico = medicos.find((m) => m.id_medico === this.medicoId);
    });

    // Carregar pacientes
    this.dataService.getPacientes().subscribe((pacientes) => {
      pacientes.forEach((p) => this.pacientesMap.set(p.id_paciente, p));
    });

    // Carregar consultas e filtrar por médico
    this.dataService.getConsultas().subscribe((consultas) => {
      this.todasConsultas = consultas.filter(
        (c) => c.id_medico === this.medicoId
      );
      this.definirEstatisticas();
      this.montarListas();
    });
  }

  private definirEstatisticas(): void {
    const agora = new Date();
    const hoje = new Date(agora);
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(hoje.getDate() + 1);

    const fimSemana = new Date(hoje);
    fimSemana.setDate(hoje.getDate() + (7 - hoje.getDay()));

    this.consultasHoje = this.todasConsultas.filter((c) =>
      this.ehMesmoDia(new Date(c.data_consulta), hoje)
    );
    this.consultasAmanha = this.todasConsultas.filter((c) =>
      this.ehMesmoDia(new Date(c.data_consulta), amanha)
    );
    this.consultasSemana = this.todasConsultas.filter((c) => {
      const dt = new Date(c.data_consulta);
      return dt >= hoje && dt <= fimSemana;
    });

    this.totalPacientes = new Set(
  this.todasConsultas
    .filter((c) => c.id_paciente != null)
    .map((c) => c.id_paciente)
).size;

  }

  private montarListas(): void {
    // Próxima consulta futura
    const futuras = this.todasConsultas
      .filter((c) => new Date(c.data_consulta) > new Date())
      .sort(
        (a, b) =>
          new Date(a.data_consulta).getTime() -
          new Date(b.data_consulta).getTime()
      );

    if (futuras.length) {
      const c = futuras[0];
      this.consultaMaisProxima = {
        consulta: c,
        paciente: this.pacientesMap.get(c.id_paciente)!,
      };
    }

    // Lista completa para exibição
    this.minhasConsultas = this.todasConsultas.map((c) => ({
      consulta: c,
      paciente: this.pacientesMap.get(c.id_paciente)!,
    }));
  }

  ehMesmoDia(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  cancelar(consulta: Consulta): void {
    // Atualiza status localmente
    consulta.status = 'cancelada';
    // Opcional: atualizar service via método específico
    this.definirEstatisticas();
    this.montarListas();
  }

  reagendar(consulta: Consulta): void {
    console.log('Reagendar', consulta.id_consulta);
  }
  abrirConfirmacao(consulta: Consulta): void {
    const paciente = this.pacientesMap.get(consulta.id_paciente);
    if (paciente) {
      this.consultaParaConfirmar = { consulta, paciente };
    }
  }

  fecharConfirmacao(): void {
    this.consultaParaConfirmar = null;
  }

  confirmarConsulta(): void {
    if (this.consultaParaConfirmar) {
      this.consultaParaConfirmar.consulta.status = 'realizada';
      this.fecharConfirmacao();
      this.definirEstatisticas();
      this.montarListas();
    }
  }
}

import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import {
  DataService,
  Consulta,
  UsuarioLogado,
} from '../services/data-service.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reagendar-consulta',
  templateUrl: './ch-appointment.component.html',
  styleUrls: ['./ch-appointment.component.css'],
  imports: [CommonModule],
})
export class ReagendarConsultaComponent implements OnInit {
  @Input() consultaOriginal!: Consulta;
  @Output() done = new EventEmitter<void>();
  @Output() canceled = new EventEmitter<void>();

  selectedDate = new Date();
  displayMonth!: string;
  displayYear!: number;
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  calendarDays: { date: Date; currentMonth: boolean }[] = [];

  times: string[] = [];
  selectedTime: string | null = null;

  allConsultas: Consulta[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.buildCalendar(this.selectedDate);
    this.generateTimes();
    this.dataService
      .getConsultas()
      .subscribe(
        (cs) =>
          (this.allConsultas = cs.filter(
            (c) => c.id_medico === this.consultaOriginal.id_medico
          ))
      );
  }

  private buildCalendar(d: Date): void {
    const y = d.getFullYear(),
      m = d.getMonth();
    this.displayMonth = d.toLocaleString('pt-BR', { month: 'long' });
    this.displayYear = y;
    const first = new Date(y, m, 1),
      last = new Date(y, m + 1, 0);
    const start = first.getDay(),
      total = last.getDate();
    this.calendarDays = [];
    for (let i = start - 1; i >= 0; i--)
      this.calendarDays.push({ date: new Date(y, m, -i), currentMonth: false });
    for (let i = 1; i <= total; i++)
      this.calendarDays.push({ date: new Date(y, m, i), currentMonth: true });
    const rem = 42 - this.calendarDays.length;
    for (let i = 1; i <= rem; i++)
      this.calendarDays.push({
        date: new Date(y, m + 1, i),
        currentMonth: false,
      });
  }

  prevMonth() {
    const d = new Date(this.selectedDate);
    d.setMonth(d.getMonth() - 1);
    this.selectedDate = d;
    this.buildCalendar(d);
  }
  nextMonth() {
    const d = new Date(this.selectedDate);
    d.setMonth(d.getMonth() + 1);
    this.selectedDate = d;
    this.buildCalendar(d);
  }
  selectDate(dt: Date) {
    this.selectedDate = dt;
    this.selectedTime = null;
  }
  isSelected(dt: Date) {
    return dt.toDateString() === this.selectedDate.toDateString();
  }

  private generateTimes() {
    for (let h = 8; h < 18; h++) {
      this.times.push(`${h.toString().padStart(2, '0')}:00`);
      this.times.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  isTimeAvailable(t: string) {
    return !this.allConsultas.some((c) => {
      const dt = new Date(c.data_consulta);
      return (
        c.status === 'agendada' && // Só bloqueia se estiver agendada
        c.id_consulta !== this.consultaOriginal.id_consulta && // Ignora a consulta original
        dt.toDateString() === this.selectedDate.toDateString() &&
        dt.toTimeString().startsWith(t)
      );
    });
  }

  selectTime(t: string) {
    if (this.isTimeAvailable(t)) this.selectedTime = t;
  }

  cancel() {
    this.canceled.emit();
  }

  confirm() {
    const [h, m] = this.selectedTime!.split(':').map(Number);
    const dt = new Date(this.selectedDate);
    dt.setHours(h, m, 0, 0);
    const user = this.dataService.getUsuarioLogado()! as UsuarioLogado;

    // Cancela original
    this.consultaOriginal.status = 'cancelada';

    // Cria nova
    const newId = Math.max(...this.allConsultas.map((c) => c.id_consulta)) + 1;
    const nova: Consulta = {
      id_consulta: newId,
      id_medico: this.consultaOriginal.id_medico,
      id_paciente: user.id,
      data_consulta: dt,
      status: 'agendada',
    };
    this.dataService.addConsulta(nova);

    this.done.emit();
  }
}

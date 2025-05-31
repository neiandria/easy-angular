import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataService, Medico, Consulta, UsuarioLogado } from '../../services/data-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-nova-consulta',
  templateUrl: './patient-new-appointment.component.html',
  styleUrls: ['./patient-new-appointment.component.css'],
  imports: [CommonModule, FormsModule]
})
export class PatientNewAppointment implements OnInit {
  step = 1;

  // Step 1
  specialties: string[] = [];
  selectedSpecialty: string | null = null;

  // Step 2
  doctors: Medico[] = [];
  selectedDoctorId: number | null = null;
  get selectedDoctor(): Medico | undefined {
    return this.doctors.find(d => d.id_medico === this.selectedDoctorId!);
  }

  // Step 3: calendário
  selectedDate: Date = new Date();
  weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  calendarDays: { date: Date; currentMonth: boolean }[] = [];

  // Step 4
  times: string[] = [];
  selectedTime: string | null = null;

  // Confirmation
  showConfirmation = false;

  // Dados carregados
  allDoctors: Medico[] = [];
  allConsultas: Consulta[] = [];

  constructor(
    private dataService: DataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // carregar médicos e especialidades
    this.dataService.getMedicos().subscribe(meds => {
      this.allDoctors = meds;
      this.specialties = Array.from(new Set(meds.map(d => d.especialidade)));
    });
    // carregar consultas
    this.dataService.getConsultas().subscribe(c => {
      this.allConsultas = c;
      this.buildCalendar(new Date());
    });
    // gerar horários padrão
    this.generateTimes();
  }

  // Wizard
  nextStep(): void { if (this.step < 5) this.step++; }
  prevStep(): void { if (this.step > 1) this.step--; }

  // Step 2: filtrar médicos
  onSelectSpecialty(): void {
    this.doctors = this.allDoctors.filter(d => d.especialidade === this.selectedSpecialty);
    this.selectedDoctorId = null;
  }

  // Step 3: calendário
  buildCalendar(date: Date): void {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    this.calendarDays = [];

    for (let i = startDay - 1; i >= 0; i--) {
      const prev = new Date(year, month, -i);
      this.calendarDays.push({ date: prev, currentMonth: false });
    }

    for (let i = 1; i <= totalDays; i++) {
      const current = new Date(year, month, i);
      this.calendarDays.push({ date: current, currentMonth: true });
    }

    const remaining = 42 - this.calendarDays.length;
    for (let i = 1; i <= remaining; i++) {
      const next = new Date(year, month + 1, i);
      this.calendarDays.push({ date: next, currentMonth: false });
    }
  }

  prevMonth(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setMonth(newDate.getMonth() - 1);
    this.selectedDate = newDate;
    this.buildCalendar(newDate);
  }

  nextMonth(): void {
    const newDate = new Date(this.selectedDate);
    newDate.setMonth(newDate.getMonth() + 1);
    this.selectedDate = newDate;
    this.buildCalendar(newDate);
  }

  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  isSelected(date: Date): boolean {
    return date.toDateString() === this.selectedDate.toDateString();
  }

  // Step 4: horários disponíveis
  generateTimes(): void {
    const start = 8, end = 18; // 8h às 18h
    for (let hour = start; hour < end; hour++) {
      this.times.push(`${hour.toString().padStart(2,'0')}:00`);
      this.times.push(`${hour.toString().padStart(2,'0')}:30`);
    }
  }

  isTimeAvailable(time: string): boolean {
    if (!this.selectedDoctorId) return false;
    return !this.allConsultas.some(c =>
      c.id_medico === this.selectedDoctorId &&
      new Date(c.data_consulta).toDateString() === this.selectedDate.toDateString() &&
      new Date(c.data_consulta).toTimeString().startsWith(time)
    );
  }

  selectTime(time: string): void {
    if (this.isTimeAvailable(time)) this.selectedTime = time;
  }

  confirmarAgendamento(): void {
    // criar nova consulta
    const newId = Math.max(...this.allConsultas.map(c => c.id_consulta)) + 1;
    const [hours, minutes] = this.selectedTime!.split(':').map(Number);
    const dt = new Date(this.selectedDate);
    dt.setHours(hours, minutes, 0, 0);

    const doctorId = this.selectedDoctorId!;
    const currentUser = this.dataService.getUsuarioLogado() as UsuarioLogado;
    const novaConsulta: Consulta = {
      id_consulta: newId,
      id_medico: doctorId,
      id_paciente: currentUser.id,
      data_consulta: dt,
      status: 'agendada'
    };

    // adicionar na service
    const updated = [...this.allConsultas, novaConsulta];
    (this.dataService as any).consultas$.next(updated);

    this.showConfirmation = true;
  }

  voltarDashboard(): void {
    const user = this.dataService.getUsuarioLogado()!;
    this.router.navigate(['/paciente', user.id]);
  }
}

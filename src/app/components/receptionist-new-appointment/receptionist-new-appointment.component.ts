import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Paciente, Medico, Consulta } from './../../services/data-service.service';

@Component({
  selector: 'app-recepcionista-schedule-wizard',
  templateUrl: './receptionist-new-appointment.component.html',
  styleUrls: ['./receptionist-new-appointment.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RecepcionistaScheduleWizardComponent implements OnInit {
  @Input() paciente: Paciente | null = null;

  step = 1;
  specialties: string[] = [];
  doctors: Medico[] = [];
  consultas: Consulta[] = [];

  selectedPaciente!: Paciente;
  selectedSpecialty: string | null = null;
  selectedDoctorId: number | null = null;
  selectedDate: Date | null = null;
  selectedTime: string | null = null;

  weekDays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
  calendarDays: { date: Date; currentMonth: boolean }[] = [];
  times: string[] = ['08:00','09:00','10:00','11:00','13:00','14:00','15:00','16:00'];

  showConfirmation = false;

  constructor(public dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    this.dataService.getConsultas().subscribe(cs => this.consultas = cs);
    this.dataService.getMedicos().subscribe(ms => {
      this.specialties = Array.from(new Set(ms.map(m => m.especialidade)));
    });
    if (this.paciente) {
      this.selectedPaciente = this.paciente;
      this.step = 2;
    }
  }

  /** Labels for wizard steps */
  getStepLabels(): string[] {
    const labels = ['Paciente','Especialidade','Médico','Data','Horário','Resumo'];
    return this.paciente ? labels.slice(1) : labels;
  }

  /** When specialty selected, load doctors */
  onSelectSpecialty(): void {
    this.dataService.getMedicos().subscribe(ms => {
      this.doctors = ms.filter(m => m.especialidade === this.selectedSpecialty);
    });
  }

  /** Prepare calendar days */
  generateCalendar(offset = 0): void {
    const today = this.selectedDate || new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + offset;
    const first = new Date(year, month, 1);
    const start = first.getDay();
    this.calendarDays = [];
    for (let i = start - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      this.calendarDays.push({ date: d, currentMonth: false });
    }
    const last = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= last; d++) {
      this.calendarDays.push({ date: new Date(year, month, d), currentMonth: true });
    }
  }

  /** Select a date */
  selectDate(date: Date): void {
    this.selectedDate = date;
  }

  /** Select a time slot */
  selectTime(time: string): void {
    this.selectedTime = time;
  }

  /** Check if date is selected */
  isSelected(date: Date): boolean {
    return this.selectedDate !== null && date.toDateString() === this.selectedDate.toDateString();
  }

  /** Check if time slot is available */
  isTimeAvailable(time: string): boolean {
    if (!this.selectedDoctorId || !this.selectedDate) return false;
    return !this.consultas.some(c => {
      const dt = new Date(c.data_consulta);
      const h = dt.getHours().toString().padStart(2, '0');
      const m = dt.getMinutes().toString().padStart(2, '0');
      return c.id_medico === this.selectedDoctorId &&
             dt.toDateString() === this.selectedDate!.toDateString() &&
             `${h}:${m}` === time;
    });
  }

  /** Proceed to next step */
  nextStep(): void {
    if (!this.paciente && this.step === 1) {
      this.step = 2;
      return;
    }
    if ((this.paciente && this.step === 1) || (!this.paciente && this.step === 2)) {
      this.generateCalendar();
    }
    this.step++;
  }

  /** Go back to previous step */
  prevStep(): void {
    this.step--;
  }

  /** Get selected doctor name */
  getDoctorName(): string {
    const doc = this.doctors.find(d => d.id_medico === this.selectedDoctorId);
    return doc ? doc.nome : '';
  }

  /** Confirm and save appointment */
  confirmarAgendamento(): void {
    if (!this.selectedPaciente || !this.selectedDoctorId || !this.selectedDate || !this.selectedTime) return;
    const [h, m] = this.selectedTime.split(':');
    const dt = new Date(this.selectedDate);
    dt.setHours(+h, +m, 0, 0);
    this.dataService.addConsulta({
      id_consulta: Date.now(),
      id_paciente: this.selectedPaciente.id_paciente,
      id_medico: this.selectedDoctorId,
      data_consulta: dt,
      status: 'agendada'
    });
    this.showConfirmation = true;
  }

  /** Navigate back to dashboard */
  voltarDashboard(): void {
    const user = this.dataService.getUsuarioLogado();
    this.router.navigate(['/recepcionista', user!.id]);
  }
}
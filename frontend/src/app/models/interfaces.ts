export interface Doctor {
  id: number;
  user_id: number;
  name: string;
  email: string;
  specialization: string;
  experience_years: number;
  consultation_fee: number;
  clinic_name: string;
  clinic_location: string;
  verification_status: string;
}

export interface Patient {
  id: number;
  user_id: number;
  phone_number?: string;
  gender?: string;
  date_of_birth?: string;
}

export interface Appointment {
  id: number;
  doctor_id: number;
  patient_id: number;
  appointment_date: string;
  appointment_time: string;
  consultation_type: 'online' | 'offline';
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid';
  doctorName?: string;
  patientName?: string;
  specialization?: string;
}

export interface Slot {
  id: number;
  doctor_id: number;
  available_day: string;
  start_time: string;
  end_time: string;
  max_patients: number;
}

export interface DoctorProfile {
  specialization: string;
  experienceYears: number;
  consultationFee: number;
  clinicName: string;
  clinicLocation: string;
}

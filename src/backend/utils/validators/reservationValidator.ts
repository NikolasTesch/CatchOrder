export interface Reservation {
  table_number: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  reservation_date: string;
  reservation_time: string;
  number_of_people: number;
  notes?: string;
}

export class ReservationValidator {
  static validate(reservation: Reservation): { valido: boolean; error: string[] } {
    const error: string[] = [];

    // Validate table number
    if (reservation.table_number === undefined || reservation.table_number === null) {
      error.push('Table number is required');
    } else if (!Number.isInteger(reservation.table_number)) {
      error.push('Table number must be an integer');
    } else if (reservation.table_number <= 0) {
      error.push('Table number must be positive');
    }

    // Validate customer name
    if (!reservation.customer_name || reservation.customer_name.trim() === '') {
      error.push('Customer name is required');
    } else if (reservation.customer_name.length < 3) {
      error.push('Customer name must be at least 3 characters');
    } else if (reservation.customer_name.length > 100) {
      error.push('Customer name must not exceed 100 characters');
    }

    // Validate customer phone
    if (!reservation.customer_phone || reservation.customer_phone.trim() === '') {
      error.push('Customer phone is required');
    } else {
      const phoneRegex = /^\+?[\d\s()-]{8,20}$/;
      if (!phoneRegex.test(reservation.customer_phone)) {
        error.push('Invalid phone format');
      }
    }

    // Validate customer email (optional)
    if (reservation.customer_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(reservation.customer_email)) {
        error.push('Invalid email format');
      }
    }

    // Validate reservation date
    if (!reservation.reservation_date || reservation.reservation_date.trim() === '') {
      error.push('Reservation date is required');
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(reservation.reservation_date)) {
        error.push('Date must be in YYYY-MM-DD format');
      } else {
        const date = new Date(reservation.reservation_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date < today) {
          error.push('Reservation date cannot be in the past');
        }
      }
    }

    // Validate reservation time
    if (!reservation.reservation_time || reservation.reservation_time.trim() === '') {
      error.push('Reservation time is required');
    } else {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(reservation.reservation_time)) {
        error.push('Time must be in HH:MM format (24-hour)');
      }
    }

    // Validate number of people
    if (reservation.number_of_people === undefined || reservation.number_of_people === null) {
      error.push('Number of people is required');
    } else if (!Number.isInteger(reservation.number_of_people)) {
      error.push('Number of people must be an integer');
    } else if (reservation.number_of_people < 1) {
      error.push('Number of people must be at least 1');
    } else if (reservation.number_of_people > 20) {
      error.push('Number of people cannot exceed 20');
    }

    // Validate notes (optional)
    if (reservation.notes && reservation.notes.length > 500) {
      error.push('Notes must not exceed 500 characters');
    }

    return {
      valido: error.length === 0,
      error,
    };
  }

  static validateStatus(status: string): { valido: boolean; error: string[] } {
    const error: string[] = [];
    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];

    if (!validStatuses.includes(status)) {
      error.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    return {
      valido: error.length === 0,
      error,
    };
  }
}

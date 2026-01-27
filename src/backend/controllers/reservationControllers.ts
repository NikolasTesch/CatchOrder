import { Request, Response } from 'express';
import { ReservationModel } from '../models/reservationModel';
import { ReservationValidator } from '../utils/validators/reservationValidator';

class ReservationController {
  /**
   * List all reservations
   * GET /reservations
   */
  async index(req: Request, res: Response): Promise<Response> {
    try {
      const status = typeof req.query.status === 'string' ? req.query.status : undefined;
      const date = typeof req.query.date === 'string' ? req.query.date : undefined;

      let reservations;

      if (status) {
        reservations = await ReservationModel.findByStatus(status);
      } else if (date) {
        reservations = await ReservationModel.findByDate(date);
      } else {
        reservations = await ReservationModel.findAll();
      }

      return res.status(200).json({
        message: 'Reservations retrieved successfully',
        data: reservations,
        count: reservations.length,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error retrieving reservations',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get reservation by ID
   * GET /reservations/:id
   */
  async show(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : String(req.params.id);

      const reservation = await ReservationModel.findById(id);

      if (!reservation) {
        return res.status(404).json({
          message: 'Reservation not found',
        });
      }

      return res.status(200).json({
        message: 'Reservation retrieved successfully',
        data: reservation,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error retrieving reservation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Create new reservation
   * POST /reservations
   */
  async store(req: Request, res: Response): Promise<Response> {
    try {
      const reservationData = req.body;

      // Validate input
      const validation = ReservationValidator.validate(reservationData);
      if (!validation.valido) {
        return res.status(400).json({
          message: 'Validation error',
          errors: validation.error,
        });
      }

      // Check table availability
      const isAvailable = await ReservationModel.checkAvailability(
        reservationData.table_number,
        reservationData.reservation_date,
        reservationData.reservation_time
      );

      if (!isAvailable) {
        return res.status(409).json({
          message: 'Table is not available at the requested time',
        });
      }

      const reservation = await ReservationModel.create(reservationData);

      return res.status(201).json({
        message: 'Reservation created successfully',
        data: reservation,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error creating reservation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Update reservation
   * PUT /reservations/:id
   */
  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : String(req.params.id);
      const updateData = req.body;

      // Check if reservation exists
      const existingReservation = await ReservationModel.findById(id);
      if (!existingReservation) {
        return res.status(404).json({
          message: 'Reservation not found',
        });
      }

      // Validate status if provided
      if (updateData.status) {
        const statusValidation = ReservationValidator.validateStatus(updateData.status);
        if (!statusValidation.valido) {
          return res.status(400).json({
            message: 'Validation error',
            errors: statusValidation.error,
          });
        }
      }

      // Check availability if changing table, date, or time
      if (
        updateData.table_number !== undefined ||
        updateData.reservation_date !== undefined ||
        updateData.reservation_time !== undefined
      ) {
        const tableNumber = updateData.table_number ?? existingReservation.table_number;
        const date = updateData.reservation_date ?? existingReservation.reservation_date;
        const time = updateData.reservation_time ?? existingReservation.reservation_time;

        const isAvailable = await ReservationModel.checkAvailability(
          tableNumber,
          date,
          time,
          id
        );

        if (!isAvailable) {
          return res.status(409).json({
            message: 'Table is not available at the requested time',
          });
        }
      }

      const reservation = await ReservationModel.update(id, updateData);

      return res.status(200).json({
        message: 'Reservation updated successfully',
        data: reservation,
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error updating reservation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Delete reservation
   * DELETE /reservations/:id
   */
  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : String(req.params.id);

      const reservation = await ReservationModel.findById(id);
      if (!reservation) {
        return res.status(404).json({
          message: 'Reservation not found',
        });
      }

      await ReservationModel.delete(id);

      return res.status(200).json({
        message: 'Reservation deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error deleting reservation',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Check table availability
   * GET /reservations/availability/:tableNumber
   */
  async checkAvailability(req: Request, res: Response): Promise<Response> {
    try {
      const tableNumber = typeof req.params.tableNumber === 'string' 
        ? req.params.tableNumber 
        : String(req.params.tableNumber);
      const date = typeof req.query.date === 'string' ? req.query.date : undefined;
      const time = typeof req.query.time === 'string' ? req.query.time : undefined;

      if (!date || !time) {
        return res.status(400).json({
          message: 'Date and time are required as strings',
        });
      }

      const isAvailable = await ReservationModel.checkAvailability(
        parseInt(tableNumber),
        date,
        time
      );

      return res.status(200).json({
        message: 'Availability checked successfully',
        data: {
          table_number: parseInt(tableNumber),
          date,
          time,
          available: isAvailable,
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: 'Error checking availability',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

export default new ReservationController();

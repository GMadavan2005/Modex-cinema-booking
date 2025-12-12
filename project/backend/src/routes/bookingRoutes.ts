import { Router } from 'express';
import { BookingController } from '../controllers/bookingController';

const router = Router();
const bookingController = new BookingController();

router.post('/booking', (req, res) => bookingController.createBooking(req, res));

router.get('/booking/:id', (req, res) => bookingController.getBookingById(req, res));

export default router;

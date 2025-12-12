import { Router } from 'express';
import { ShowController, deleteShow } from '../controllers/showController';

const router = Router();
const showController = new ShowController();

router.post('/admin/show', (req, res) => showController.createShow(req, res));

router.delete('/admin/show/:id', (req, res) => deleteShow(req, res));

router.get('/shows', (req, res) => showController.getAllShows(req, res));

router.get('/shows/:id', (req, res) => showController.getShowById(req, res));

router.get('/shows/:showId/allocated-seats', (req, res) =>
  showController.getAllocatedSeats(req, res)
);

router.get('/shows/:showId/bookings', (req, res) =>
  showController.getBookingsForShow(req, res)
);

export default router;

import express from 'express';
import {
    getCreditCards,
    getCreditCard,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard
} from '../controllers/creditCard.controller.js';
import { authenticatedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticatedRoute); // All credit card routes require authentication

router.route('/')
    .get(getCreditCards)
    .post(createCreditCard);

router.route('/:id')
    .get(getCreditCard)
    .put(updateCreditCard)
    .delete(deleteCreditCard);

export default router;

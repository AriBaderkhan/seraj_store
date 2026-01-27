import express from 'express';
const router = express.Router();

import authValidate from '../validates/authValidate.js';
import authController from '../controllers/authController.js';



router.post('/login', authValidate.login, authController.login);



export default router;
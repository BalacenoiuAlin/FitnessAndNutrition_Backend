import express from 'express';
import { login, register } from '../controllers/authentication';
import { isAuthenticated } from '../middlewares';

const router = express.Router();

export default (): express.Router => {
    router.post('/auth/login', login);
    router.post('/auth/register', register);
    router.get('/protected-route', isAuthenticated, (req, res) => {
        return res.status(200).json({ message: 'You have access to this protected route' });
    });

    return router;
};

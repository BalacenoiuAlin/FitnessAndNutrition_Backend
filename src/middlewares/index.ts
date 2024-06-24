import { Request, Response, NextFunction } from 'express';
import { getUserBySessionToken } from '../db/users';

interface AuthenticatedRequest extends Request {
    identity?: { email: string };
}

export const isAuthenticated = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const sessionToken = req.cookies['ANTONIO-AUTH'];

        if (!sessionToken) {
            return res.sendStatus(403);
        }

        const existingUser = await getUserBySessionToken(sessionToken);

        if (!existingUser) {
            return res.sendStatus(403);
        }

        req.identity = { email: existingUser.email };

        return next();
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

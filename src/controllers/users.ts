import { Request, Response } from 'express';
import { getUserByEmail, getUsers } from '../db/users';

interface AuthenticatedRequest extends Request {
    identity?: { email: string };
}

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await getUsers();
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
};

export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userEmail = req.identity?.email;
        if (!userEmail) {
            return res.status(400).json({ error: 'User email not found in request' });
        }
        const user = await getUserByEmail(userEmail);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

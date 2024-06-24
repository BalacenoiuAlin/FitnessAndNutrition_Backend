import express, { Request, Response } from 'express';
import { getUserByEmail, createUser } from '../db/users';
import { random, authentication } from '../helpers';

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Missing email or password' });
        }

        const user = await getUserByEmail(email).select('+authentication.salt +authentication.password');

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        const expectedHash = authentication(user.authentication.salt, password);

        if (user.authentication.password !== expectedHash) {
            return res.status(403).json({ error: 'Invalid email or password' });
        }

        const salt = random();
        user.authentication.sessionToken = authentication(salt, user._id.toString());

        await user.save();

        res.cookie('ANTONIO-AUTH', user.authentication.sessionToken, {
            httpOnly: true,
            secure: false, 
            domain: '192.168.1.4',
            path: '/',
        });

        return res.status(200).json(user).end();
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: 'Internal server error' });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName, gender, birthDate, weight, desiredWeight, height, goal, activity } = req.body;

        if (!email || !password || !firstName || !lastName || !gender || !birthDate || !weight || !desiredWeight || !height || !goal || !activity) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await getUserByEmail(email);

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const salt = random();
        const user = await createUser({
            email,
            firstName,
            lastName,
            gender,
            birthDate,
            weight,
            desiredWeight,
            height,
            goal,
            activity,
            authentication: {
                salt,
                password: authentication(salt, password),
            }
        });

        return res.status(200).json(user).end();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

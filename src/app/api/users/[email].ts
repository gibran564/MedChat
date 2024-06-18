import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import User from '@/app/models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { method } = req;
    const { email } = req.query;

    await dbConnect();

    switch (method) {
        case 'GET':
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
                }
                res.status(200).json({ success: true, data: user });
            } catch (error) {
                res.status(400).json({ success: false, error });
            }
            break;
        case 'PUT':
            try {
                const user = await User.findOneAndUpdate({ email }, req.body, {
                    new: true,
                    runValidators: true,
                });
                if (!user) {
                    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
                }
                res.status(200).json({ success: true, data: user });
            } catch (error) {
                res.status(400).json({ success: false, error });
            }
            break;
        default:
            res.status(400).json({ success: false });
            break;
    }
}

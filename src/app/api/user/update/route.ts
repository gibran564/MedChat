import connectDB from '@/utils/dbConnect';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/app/models/user';

export async function POST(req: NextRequest) {
    const { email, ...updateFields } = await req.json();

    if (!email) {
        return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    try {
        await connectDB();

        const user = await User.findOneAndUpdate(
            { email: email },
            { $set: updateFields },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User updated successfully', user }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error', error }, { status: 500 });
    }
}

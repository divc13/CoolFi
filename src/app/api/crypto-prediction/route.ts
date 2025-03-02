import { NextResponse } from 'next/server';
import { predictions, updatePredictions } from '@/app/services/predictions';

const expectedCurrencies = ["DOGE", "NEAR", "BITCOIN", "ETH", "SOLANA", "PEPE", "MAGA", "XRP"];

export async function POST(req: Request) {
    const AUTH_TOKEN = process.env.AUTH_TOKEN;

    if (!AUTH_TOKEN) {
        return NextResponse.json({ error: "Server authorization token is not set" }, { status: 500 });
    }

    const authHeader = req.headers.get('authorization');

    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();

        for (const currency of expectedCurrencies) {
            if (!body[currency] || !Array.isArray(body[currency]) || body[currency].length !== 4) {
                return NextResponse.json({ error: `Invalid data for ${currency}, expected an array of 4 numbers` }, { status: 400 });
            }
        }
        updatePredictions(body); // Update predictions globally

        return NextResponse.json({ message: "Predictions updated successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}

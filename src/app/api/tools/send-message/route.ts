import { NextResponse } from 'next/server';
import { settings } from "@/app/config";

import { Scraper } from "agent-twitter-client";
import { Cookie } from 'tough-cookie';

let sessionCookies:Cookie[]; 

async function login() : Promise<Scraper>
{
    const scraper:Scraper = new Scraper();
    if (sessionCookies) {
        console.log("✅ Using cached session cookies...");
        await scraper.setCookies(sessionCookies);
    } else {
        console.log("🔄 Logging in...");
        await scraper.login(
            settings.twitterUsername,
            settings.twitterPassword,
            settings.twitterEmail,
            settings.bitteApiKey,
            settings.twitterApiSecretKey,
            settings.twitterAccessToken,
            settings.twitterAccessTokenSecret
        );

        sessionCookies = await scraper.getCookies();
        console.log("Session cookies saved in memory.");
    }

    return scraper;
}

async function sendDM(conversationId: string, message_to_send: string) {
    const scrapper = await login();
    await scrapper.sendDirectMessage(conversationId, message_to_send);
}


export async function GET(request: Request)
{
    try {
        const { searchParams } = new URL(request.url);
        console.log(searchParams);
        const conversationId = searchParams.get('conversationId');
        const message = searchParams.get('message');

        console.log("In function sendDM:", { conversationId, message });

        if (!conversationId || !message) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // await sendDM(conversationId, message);

        return NextResponse.json({}, { status: 200 });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message on twitter' }, { status: 500 });
  }
}

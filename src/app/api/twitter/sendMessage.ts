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

export async function sendDM(conversationId: string, message_to_send: string) {
    const scrapper = await login();
    await scrapper.sendDirectMessage(conversationId, message_to_send);
}

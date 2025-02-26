import { NextRequest, NextResponse } from "next/server";
import type { Tweet } from "agent-twitter-client";

// ✅ Force Node.js runtime (Important for `agent-twitter-client`)
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let sessionCookies: any = null; // ✅ Store session cookies globally

export async function GET(req: NextRequest) {
  try {
    // ✅ Dynamic import of `agent-twitter-client` inside try-catch
    let Scraper, SearchMode;
    try {
      const twitterClient = await import("agent-twitter-client");
      Scraper = twitterClient.Scraper;
      SearchMode = twitterClient.SearchMode;
    } catch (importError) {
      console.error("Failed to import agent-twitter-client:", importError);
      return NextResponse.json({ error: "Failed to initialize Twitter client" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const coin = searchParams.get("coin");

    if (!coin) {
      return NextResponse.json({ error: "Coin name is required" }, { status: 400 });
    }

    // ✅ Initialize scraper
    const scraper = new Scraper();

    try {
      if (sessionCookies) {
        console.log("✅ Using cached session cookies...");
        await scraper.setCookies(sessionCookies);
      } else {
        console.log("🔄 No session cookies found. Logging in...");

        

        // ✅ Perform login and cache session cookies
        await scraper.login(
          process.env.TWITTER_USERNAME!,
          process.env.TWITTER_PASSWORD!,
          process.env.TWITTER_EMAIL!,
          process.env.TWITTER_APP_KEY!,
          process.env.TWITTER_APP_SECRET!,
          process.env.TWITTER_ACCESS_TOKEN!,
          process.env.TWITTER_ACCESS_SECRET!
        );

        sessionCookies = await scraper.getCookies();
        console.log("✅ Session cookies saved.");
      }

      // ✅ Fetch latest tweets
      const count = 15;
      const query = `${coin}`;
      console.log(`🔍 Searching for latest tweets: "${query}"`);
      const tweetStream = scraper.searchTweets(query, count, SearchMode.Top);

      const fetchedTweets: Tweet[] = [];
      let index = 0;

      for await (const tweet of tweetStream) {
        if (index >= count) break;
        fetchedTweets.push(tweet as Tweet);
        index++;
      }

      console.log(`✅ Retrieved ${fetchedTweets.length} tweets.`);
      return NextResponse.json({ tweets: fetchedTweets }, { status: 200 });
    } catch (scrapingError) {
      console.error("❌ Error during Twitter scraping:", scrapingError);
      return NextResponse.json({ error: "Failed to fetch tweets from Twitter" }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

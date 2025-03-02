import { Scraper, SearchMode } from "agent-twitter-client";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import fs from "fs";
import xlsx from "xlsx";
import { exec } from "child_process";


dotenv.config();

const COINS = ["ETH", "BITCOIN", "SOLANA", "PEPE", "DOGE", "MAGA", "NEAR", "XRP"];
const TWEETS_PER_COIN = 500;
const RETRY_LIMIT = 2;
const EMAIL_RECIPIENT = process.env.EMAIL_RECIPIENT;
const DATA_DIR = "./cron/tweet_data";  // Directory to store Excel files

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

let sessionCookies = null; // Store session cookies in memory

async function fetchTweets(coin, scraper, targetDate) {
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);
  const since = targetDate.toISOString().split("T")[0];
  const until = nextDate.toISOString().split("T")[0];
  const query = `${coin} since:${since} until:${until}`;
  
  console.log(`🔍 Fetching tweets for: ${coin} (${since} - ${until})`);

  for (let attempt = 1; attempt <= RETRY_LIMIT + 1; attempt++) {
    try {
      const tweets = [];

      const tweetStream = scraper.searchTweets(query, TWEETS_PER_COIN, SearchMode.Top);
      for await (const tweet of tweetStream) {
        if (tweets.length >= TWEETS_PER_COIN) break;

        // ✅ FIX: Convert UNIX timestamp properly
        const tweetDate = new Date(tweet.timestamp * 1000).toISOString().split("T")[0];

        tweets.push({
          Date: tweetDate,  // ✅ Correctly formatted date
          Username: tweet.username,
          Text: tweet.text,
          Likes: tweet.likes,
          Retweets: tweet.retweets,
          Replies: tweet.replies,
          Hashtags: tweet.hashtags.join(", "),
          Mentions: tweet.mentions.map((m) => m.username).join(", "),
          QuotedText: tweet.quotedStatus ? tweet.quotedStatus.text : "",
          Thread: tweet.thread.length ? tweet.thread.map((t) => t.text).join(" | ") : "",
          Urls: tweet.urls.join(", "),
          IsRetweet: tweet.isRetweet ? "Yes" : "No",
          IsReply: tweet.isReply ? "Yes" : "No",
          Views: tweet.views || 0,
          SensitiveContent: tweet.sensitiveContent ? "Yes" : "No",
        });
      }

      console.log(`✅ Fetched ${tweets.length} tweets for ${coin} on ${since}`);
      return tweets;
    } catch (error) {
      console.error(`❌ Error fetching ${coin} (Attempt ${attempt}/${RETRY_LIMIT + 1}):`, error);
      if (attempt === RETRY_LIMIT + 1) {
        console.warn(`⚠️ Skipping ${coin} for ${since} after ${RETRY_LIMIT + 1} failed attempts.`);
        return [];
      }
    }
  }
}

function getLastScrapedDate() {
  const files = fs.readdirSync(DATA_DIR)
    .filter(file => file.startsWith("tweets_") && file.endsWith(".xlsx"))
    .map(file => file.replace("tweets_", "").replace(".xlsx", ""))
    .sort((a, b) => new Date(b) - new Date(a)); // Sort in descending order

  return files.length > 0 ? new Date(files[0]) : null;
}


async function scrapeTweets() {
  const scraper = new Scraper();

  if (sessionCookies) {
    console.log("✅ Using cached session cookies...");
    await scraper.setCookies(sessionCookies);
  } else {
    console.log("🔄 Logging in...");
    await scraper.login(
      process.env.TWITTER_USERNAME,
      process.env.TWITTER_PASSWORD,
      process.env.TWITTER_EMAIL,
      process.env.TWITTER_API_KEY,
      process.env.TWITTER_API_SECRET_KEY,
      process.env.TWITTER_ACCESS_TOKEN,
      process.env.TWITTER_ACCESS_TOKEN_SECRET
    );

    sessionCookies = await scraper.getCookies();
    console.log("✅ Session cookies saved in memory.");
  }

  const lastScrapedDate = getLastScrapedDate();
  const startDate = new Date(lastScrapedDate);

  const today = new Date();
  // const startDate = new Date("2024-05-21");
//  startDate.setMonth(startDate.getMonth() - 9);
//  today.setMonth(today.getMonth() - 6);

  while (startDate <= today) {
    const dateString = startDate.toISOString().split("T")[0];
    let allTweets = {};

    console.log(`📅 Collecting data for: ${dateString}`);

    for (const coin of COINS) {
      allTweets[coin] = await fetchTweets(coin, scraper, startDate);
    }

    // Save tweets to Excel
    saveToExcel(allTweets, dateString);

    // Send minimal email notification
    await sendEmail(dateString);

    // Move to the next day
    startDate.setDate(startDate.getDate() + 1);
  }
  return { today, lastScrapedDate };
}

function saveToExcel(allTweets, dateString) {
  const xlsxFilePath = `${DATA_DIR}/tweets_${dateString}.xlsx`;
  const wb = xlsx.utils.book_new();

  for (const coin of COINS) {
    if (!allTweets[coin] || allTweets[coin].length === 0) continue;

    // Convert to Excel format
    const ws = xlsx.utils.json_to_sheet(allTweets[coin]);
    xlsx.utils.book_append_sheet(wb, ws, coin);
  }

  // Write Excel file
  xlsx.writeFile(wb, xlsxFilePath);
  console.log(`📁 Excel saved: ${xlsxFilePath}`);
}

async function sendEmail(dateString) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_SENDER,
    to: EMAIL_RECIPIENT,
    subject: `Crypto Tweets Report - ${dateString}`,
    text: "Data collected for this day.",
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent for ${dateString} to ${EMAIL_RECIPIENT}`);
  } catch (error) {
    console.error(`❌ Email sending failed for ${dateString}:`, error);
  }
}

export async function GET() {
  try {
    const { today, lastScrapedDate} = scrapeTweets();

    exec(`cd cron && python3 main_extract.py ${today} ${lastScrapedDate} && python3 main_sentiments.py ${today} ${lastScrapedDate} && python3 main_data_make.py ${today} ${lastScrapedDate} && python3 main_train.py ${today} ${lastScrapedDate}`, (error, stdout, stderr) => {
        console.log(stdout);
    });

    return Response.json({ status: 200 });
  } catch (error) {
    console.error("Error fetching balances:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

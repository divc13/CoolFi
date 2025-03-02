import { NextResponse } from 'next/server';
import fs from "fs";
import path from "path";
import csv from "csv-parser";

interface DataRow {
  Date: string;
  Predicted: number;
  [key: string]: any; // Capture additional columns if needed
}

const readFilteredRows = (csvFilePath: string): Promise<DataRow[]> => {
  return new Promise((resolve, reject) => {
    const results: DataRow[] = [];

    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (row: any) => {
        const predictedValue = parseFloat(row["Predicted"]);
        if (predictedValue > 0.1 || predictedValue < -0.1) {
          results.push({ ...row, Predicted: predictedValue });
        }
      })
      .on("end", () => resolve(results))
      .on("error", (err) => reject(err));
  });
};


export async function GET() {
  try {
    const csvFilePath = path.join(process.cwd(), "cron", "cron", "predicted_returns.csv");

    const filteredRows = await readFilteredRows(csvFilePath);

    if (filteredRows.length === 0) {
      return NextResponse.json({ message: "No significant predictions found." });
    }

    // Pick a random row
    const randomRow = filteredRows[Math.floor(Math.random() * filteredRows.length)];

    // Construct the message based on the prediction
    const trend = randomRow.Predicted > 0 ? "rise" : "fall";
    const message = `Prediction: ${randomRow.Crypto} is expected to ${trend}. in the next few days.`;

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Error generating crypto prediction:", error);
    return NextResponse.json({ error: "Failed to generate crypto prediction" }, { status: 500 });
  }
}


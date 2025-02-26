import { type NextRequest, NextResponse } from 'next/server';
import {settings} from "@/app/config"

const BITTE_API_KEY = settings.bitteApiKey;
const BITTE_API_URL = settings.bitteApiUrl;

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export const GET = async (req: NextRequest): Promise<NextResponse> => {

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const url = `${BITTE_API_URL}/history?id=${id}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${BITTE_API_KEY}`,
    },
  });

  console.log(response);

  const result = await response.json();

  return NextResponse.json(result);
};
import type { NextRequest } from "next/server";
import {settings} from "@/app/config"

const BITTE_API_KEY = settings.bitteApiKey;
const BITTE_API_URL = settings.bitteApiUrl;

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const POST = async (req: NextRequest): Promise<Response> => {
  const requestInit: RequestInit & { duplex: "half" } = {
    method: "POST",
    body: req.body,
    headers: {
      Authorization: `Bearer ${BITTE_API_KEY}`,
    },
    duplex: "half",
  };

  const url = `${BITTE_API_URL}/chat`;

  const upstreamResponse = await fetch(url, requestInit);
  const headers = new Headers(upstreamResponse.headers);
  headers.delete("Content-Encoding");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
};
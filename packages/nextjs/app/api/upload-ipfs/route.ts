import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT ?? process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY ?? process.env.NEXT_PUBLIC_GATEWAY_URL,
});

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT ?? process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!jwt) {
      return NextResponse.json(
        { error: "Pinata JWT not configured. Set PINATA_JWT or NEXT_PUBLIC_PINATA_JWT in .env.local" },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const upload = await pinata.upload.public.file(file);
    if (!upload.cid) {
      return NextResponse.json({ error: "Upload failed - no CID returned" }, { status: 500 });
    }

    const gateway = process.env.PINATA_GATEWAY ?? process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://gateway.pinata.cloud";
    const ipfsUrl = `${gateway.replace(/\/$/, "")}/ipfs/${upload.cid}`;

    return NextResponse.json({ url: ipfsUrl, cid: upload.cid });
  } catch (error) {
    console.error("IPFS upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload to IPFS" },
      { status: 500 }
    );
  }
}

import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

export interface NFTMetadata {
  name: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number | boolean;
  }>;
}

export type CreatePropertyMetadata = {
  state: string;
  propertY_name: string;
  propertY_address: string;
  city: string;
  zip_code: string;
  price: number;
  duration: number;
  currency: string;
  flexible_payment: boolean;
};

/**
 * Builds a valid IPFS gateway URL from a CID.
 * Guards against undefined NEXT_PUBLIC_GATEWAY_URL.
 */
function buildGatewayUrl(cid: string): string {
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL;

  if (!gateway) {
    console.warn(
      "⚠️  NEXT_PUBLIC_GATEWAY_URL is not set. " +
        "Falling back to https://gateway.pinata.cloud. " +
        "Set this in your .env.local file."
    );
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  }

  // Strip trailing slash to avoid double-slash in URL
  const cleanGateway = gateway.replace(/\/$/, "");
  return `${cleanGateway}/ipfs/${cid}`;
}

/**
 * Uploads an image file to IPFS via Pinata and returns the full gateway URL.
 */
export const uploadToIPFS = async (file: File): Promise<string> => {
  if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
    throw new Error(
      "NEXT_PUBLIC_PINATA_JWT is not set. Check your .env.local file."
    );
  }

  try {
    const upload = await pinata.upload.public.file(file);

    if (!upload.cid) {
      throw new Error("Upload failed - no CID returned from Pinata");
    }

    const ipfsUrl = buildGatewayUrl(upload.cid);
    console.log("✅ Image uploaded to IPFS:", ipfsUrl);
    return ipfsUrl;
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload image to IPFS");
  }
};

/**
 * Uploads NFT metadata JSON to IPFS via Pinata and returns the full gateway URL.
 */
export const uploadMetadata = async (
  metadata: NFTMetadata,
  propertyMetadata: CreatePropertyMetadata
): Promise<string> => {
  if (!process.env.NEXT_PUBLIC_PINATA_JWT) {
    throw new Error(
      "NEXT_PUBLIC_PINATA_JWT is not set. Check your .env.local file."
    );
  }

  try {
    const fullMetadata = {
      ...metadata,
      attributes: [
        { trait_type: "city", value: propertyMetadata.city },
        { trait_type: "state", value: propertyMetadata.state },
        { trait_type: "zip_code", value: propertyMetadata.zip_code },
        { trait_type: "price", value: propertyMetadata.price },
        { trait_type: "duration", value: propertyMetadata.duration },
        { trait_type: "currency", value: propertyMetadata.currency },
        {
          trait_type: "flexible_payment",
          value: String(propertyMetadata.flexible_payment),
        },
      ],
    };

    const metadataBlob = new Blob([JSON.stringify(fullMetadata)], {
      type: "application/json",
    });
    const metadataFile = new File([metadataBlob], "metadata.json", {
      type: "application/json",
    });

    const upload = await pinata.upload.public.file(metadataFile);

    if (!upload.cid) {
      throw new Error("Metadata upload failed - no CID returned from Pinata");
    }

    const ipfsUrl = buildGatewayUrl(upload.cid);
    console.log("✅ Metadata uploaded to IPFS:", ipfsUrl);
    return ipfsUrl;
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
};

export const fetchNftCollectionsFromPinata = async (address: string) => {
  try {
    const files = await pinata.files
      .public
      .list()
      .keyvalues({
        // @ts-ignore
        user: address,
        type: "nft-metadata",
      });
    return files;
  } catch (error) {
    console.error("Error getting NFT collections:", error);
    throw new Error("Failed to retrieve user NFTs");
  }
};
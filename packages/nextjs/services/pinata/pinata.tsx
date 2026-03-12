import { PinataSDK } from 'pinata'
// import { ensureEthereumAvailable } from ".";

const pinata = new PinataSDK({
    pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT,
    pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL
});

export interface NFTMetadata {
    name: string;
    // description: string;
    image: string;
    attributes?: Array<{
        trait_type: string;
        value: string | number;
    }>;
}

export type CreatePropertyMetadata =  {
    state: string;
    propertY_name: string;
    propertY_address: string;
    city: string;
    zip_code: string;
    price: number;
    duration: number;
    currency: string;
    flexible_payment: boolean;
}


// export const uploadToIPFS = async (file: File): Promise<string> => {
//     try {
//         // Get presigned URL from your server
//         const urlResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/presigned_url`, {
//             method: "GET",
//             headers: {
//                 // Add your server authorization headers here
//             }
//         });

//         console.log(urlResponse)
//         const data = await urlResponse.json();

//         // Upload file using presigned URL
//         const upload = await pinata.upload.public
//             .file(file)
//             .url(data.url)
//             // .keyvalues({
//             //     user: address
//             // });

//         if (!upload.cid) {
//             throw new Error('Upload failed - no CID returned');
//         }

//         // Convert CID to IPFS URL
//         const ipfsUrl = await pinata.gateways.public.convert(upload.cid);
//         return ipfsUrl;
//     } catch (error) {
//         console.error('Error uploading to IPFS:', error);
//         throw new Error('Failed to upload to IPFS');
//     }
// };

/** Upload via our API route to avoid CORS and keep JWT server-side. */
async function uploadFileViaApi(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const base = typeof window !== "undefined" ? window.location.origin : "";
  const res = await fetch(`${base}/api/upload-ipfs`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "Upload failed");
  }

  const { url } = await res.json();
  if (!url) throw new Error("No URL returned from upload");
  return url;
}

export const uploadToIPFS = async (file: File): Promise<string> => {
  try {
    return await uploadFileViaApi(file);
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    throw new Error("Failed to upload to IPFS");
  }
};


// export const uploadMetadata = async (metadata: NFTMetadata, propertyMetadata: CreatePropertyMetadata): Promise<string> => {
//     try {
//         // Get presigned URL from your server
//         const urlResponse = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/presigned_url`, {
//             method: "GET",
//             headers: {
//                 // Add your server authorization headers here
//             }
//         });
//         const data = await urlResponse.json();

//         // Convert metadata to File
//         const metadataBlob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
//         const metadataFile = new File([metadataBlob], 'metadata.json', { type: 'application/json' });

//         // Upload metadata using presigned URL
//         const upload = await pinata.upload.public
//             .file(metadataFile)
//             // .url(data.url)
//             .keyvalues({
//                 state: propertyMetadata.state,
//                 propertY_name: propertyMetadata.propertY_name,
//                 propertY_address: propertyMetadata.propertY_address,
//                 city: propertyMetadata.city,
//                 zip_code: propertyMetadata.zip_code,
//                 price: `${propertyMetadata.price}`,
//                 duration: `${propertyMetadata.duration}`,
//                 currency: propertyMetadata.currency,
//                 flexible_payment: `${propertyMetadata.flexible_payment}`
//             });

//         if (!upload.cid) {
//             throw new Error('Upload failed - no CID returned');
//         }

//         // Convert CID to IPFS URL
//         const ipfsUrl = await pinata.gateways.public.convert(upload.cid);
//         return ipfsUrl;
//     } catch (error) {
//         console.error('Error uploading metadata to IPFS:', error);
//         throw new Error('Failed to upload metadata to IPFS');
//     }
// }; 

export const uploadMetadata = async (
  metadata: NFTMetadata,
  propertyMetadata: CreatePropertyMetadata
): Promise<string> => {
  try {
    const metadataBlob = new Blob(
      [
        JSON.stringify({
          ...metadata,
          attributes: [
            { trait_type: "city", value: propertyMetadata.city },
            { trait_type: "state", value: propertyMetadata.state },
            { trait_type: "zip_code", value: propertyMetadata.zip_code },
            { trait_type: "price", value: propertyMetadata.price },
            { trait_type: "duration", value: propertyMetadata.duration },
            { trait_type: "currency", value: propertyMetadata.currency },
            { trait_type: "flexible_payment", value: propertyMetadata.flexible_payment },
          ],
        }),
      ],
      { type: "application/json" }
    );

    const metadataFile = new File([metadataBlob], "metadata.json", {
      type: "application/json",
    });

    return await uploadFileViaApi(metadataFile);
  } catch (error) {
    console.error("Error uploading metadata to IPFS:", error);
    throw new Error("Failed to upload metadata to IPFS");
  }
};

// I did not take this is to consideration - so i am just fetching the NFTS from
// IPFS via pinata. In the real world case, i'll need to retrieve this from the blockchain

// https://example-gateway.mypinata.cloud/ipfs/{cid}
export const fetchNftCollectionsFromPinata = async (address: string) => {
    // await ensureEthereumAvailable();

    console.log(address)

    try{
        const files = await pinata.files
            .public
            .list()
            .keyvalues({
                //@ts-ignore
                user: address.address,
                type: "nft-metadata"
            })
        
        return files

    } catch (error) {
        console.error('Error getting NFT collections:', error);
        throw new Error('Failed to retrieve user NFTs');
    }
}
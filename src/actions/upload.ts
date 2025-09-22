"use server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { isAuthorized } from "@/libs/isAuthorized";

const s3Client = new S3Client({
	region: "auto",
	endpoint: `https://${process.env.R2_ACCOUNT_ID}.eu.r2.cloudflarestorage.com`,
	forcePathStyle: true,
	credentials: {
	  accessKeyId: process.env.R2_ACCESS_KEY_ID!,
	  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
	},
  });  

const acceptedTypes = ["image/png", "image/jpeg", "image/jpg"];
const maxSize = 2000000; // 2mb

interface SignedURLSuccess {
  url: string;
  key: string;
}

interface SignedURLResponse {
  success?: SignedURLSuccess;
  failure?: string;
}

export async function getSignedURL(type: string, size: number) {
	const user = await isAuthorized();
  
	if (!user) {
	  return { failure: "Not authenticated" };
	}
  
	if (!acceptedTypes.includes(type)) {
	  return { failure: "Invalid file type" };
	}
  
	if (size > maxSize) {
	  return { failure: "File too large" };
	}
  
	const key = `profile-image--${user.id}`;
  
	const putObjectCommand = new PutObjectCommand({
	  Bucket: process.env.R2_BUCKET_NAME!,
	  Key: key,
	  ContentType: type,
	  ContentLength: size,
	  Metadata: {
		userId: user.id,
	  },
	});
  
	let url;
	try {
	  url = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 60 });
	  console.log("Generated Signed URL:", url);
	} catch (error) {
	  console.error("Error generating signed URL:", error);
	  return { failure: "Error generating signed URL" };
	}
  
	return { success: { url, key } };
  }
  
export async function getSignedURLForGallery(
  type: string, 
  size: number, 
  index: number
): Promise<SignedURLResponse> {
  const user = await isAuthorized();
  
  if (!user) {
    return { failure: "Not authenticated" };
  }
  
  if (!acceptedTypes.includes(type)) {
    return { failure: "Invalid file type" };
  }
  
  if (size > maxSize) {
    return { failure: "File too large" };
  }
  
  const key = `gallery-image-${index}--${user.id}--${Date.now()}`;
  
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    ContentType: type,
    ContentLength: size,
    Metadata: {
      userId: user.id,
      type: 'gallery'
    },
  });
  
  try {
    const url = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 60 });
    return { 
      success: { 
        url, 
        key 
      } 
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return { failure: "Error generating signed URL" };
  }
}
  

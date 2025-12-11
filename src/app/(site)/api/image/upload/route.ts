import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody;

  // Extract bucket parameter from the request URL or body
  const url = new URL(request.url);
  const bucket = url.searchParams.get("bucket") || "default";

  try {
    // Select the appropriate token based on the bucket
    const getTokenForBucket = (bucketName: string) => {
      switch (bucketName) {
        case "admin":
          return process.env.BLOB_READ_WRITE_TOKEN_ADMIN;
        default:
          return process.env.BLOB_READ_WRITE_TOKEN; // default bucket for main app
      }
    };

    const token = getTokenForBucket(bucket);

    if (!token) {
      return Response.json(
        { error: `No token configured for bucket: ${bucket}` },
        { status: 400 }
      );
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      token, // Specify the token for the specific blob store
      onBeforeGenerateToken: async () => {
        return {
          allowedContentTypes: ["image/*", "video/*"],
          allowOverwrite: true,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        console.log(`Upload completed to bucket: ${bucket}`);
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }
}

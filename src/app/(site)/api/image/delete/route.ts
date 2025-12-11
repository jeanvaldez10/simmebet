import { del } from "@vercel/blob";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const urlToDelete = searchParams.get("url") as string;
    await del(urlToDelete);

    return Response.json({
      message: "Image deleted successfully",
      status: 200,
    });
  } catch (error) {
    return Response.json({
      message: (error as Error).message || "Failed to delete, Try later!",
      status: 400,
    });
  }
}

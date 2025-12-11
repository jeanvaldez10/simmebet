export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code") as string;
    console.log(code);

    if (code !== "test") {
      return Response.json({
        message: "Provided code is not valid",
        status: 400,
      });
    }

    return Response.json({
      message: "Access granted successfully",
      status: 200,
    });
  } catch (error) {
    return Response.json({
      message: (error as Error).message || "Failed to validate, Try later!",
      status: 400,
    });
  }
}

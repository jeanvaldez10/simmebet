import { NextResponse } from "next/server";
import { startWebsocketIndexer } from "../../../../../jobs/websocketMarketIndexer";

let indexerProcess: Promise<unknown> | null = null;

export async function POST() {
  try {
    if (indexerProcess) {
      return NextResponse.json(
        { error: "Websocket indexer already running" },
        { status: 400 }
      );
    }

    indexerProcess = startWebsocketIndexer();
    return NextResponse.json({
      success: true,
      message: "Websocket indexer started",
    });
  } catch (error) {
    console.error("Failed to start websocket indexer:", error);
    return NextResponse.json(
      { error: "Failed to start indexer" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    running: indexerProcess !== null,
    message: indexerProcess
      ? "Websocket indexer is running"
      : "Websocket indexer is not running",
  });
}

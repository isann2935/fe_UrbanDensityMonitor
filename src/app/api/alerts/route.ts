// src/app/api/alerts/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get("stream_id");
    const isReadParam = searchParams.get("is_read");
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    let query = supabaseServer
      .from("alerts")
      .select("*", { count: "exact" });

    if (streamId) {
      query = query.eq("stream_id", streamId);
    }
    if (isReadParam !== null && isReadParam !== undefined && isReadParam !== "") {
      query = query.eq("is_read", isReadParam === "true");
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("API /api/alerts error:", error);
      return NextResponse.json(
        { message: error.message || "Failed to fetch alerts" },
        { status: 500 }
      );
    }

    const alerts = data || [];

    // Resolve stream location manually (alerts.stream_id has no FK to streams).
    const streamIds = Array.from(
      new Set(alerts.map((a: any) => a.stream_id).filter(Boolean))
    );
    const locationById: Record<string, string> = {};
    if (streamIds.length > 0) {
      const { data: streamsData } = await supabaseServer
        .from("streams")
        .select("id, location_name")
        .in("id", streamIds);
      for (const s of streamsData || []) {
        locationById[s.id] = s.location_name;
      }
    }

    const formattedData = alerts.map((item: any) => ({
      ...item,
      stream_location:
        item.stream_location ?? locationById[item.stream_id] ?? null,
    }));

    return NextResponse.json({
      data: formattedData,
      total: count ?? formattedData.length,
      limit,
      offset,
    });
  } catch (err: any) {
    console.error("API /api/alerts exception:", err);
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

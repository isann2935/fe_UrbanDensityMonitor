// src/app/api/history/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const streamId = searchParams.get("stream_id");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const densityStatus = searchParams.get("density_status");
    const dateFrom = searchParams.get("date_from");
    const dateTo = searchParams.get("date_to");

    let query = supabaseServer
      .from("traffic_history")
      .select("*", { count: "exact" });

    if (streamId) {
      query = query.eq("stream_id", streamId);
    }
    if (densityStatus) {
      query = query.eq("density_status", densityStatus);
    }
    if (dateFrom) {
      query = query.gte("recorded_at", dateFrom);
    }
    if (dateTo) {
      query = query.lte("recorded_at", dateTo);
    }

    query = query
      .order("recorded_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json(
        { message: error.message || "Failed to fetch traffic history" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: count ?? (data || []).length,
      limit,
      offset,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

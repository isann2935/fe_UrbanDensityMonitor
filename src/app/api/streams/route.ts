// src/app/api/streams/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/infrastructure/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from("streams")
      .select("*")
      .order("location_name", { ascending: true });

    if (error) {
      return NextResponse.json(
        { message: error.message || "Failed to fetch streams" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: data || [],
      total: (data || []).length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { location_name, stream_url, stream_type } = body;

    if (!location_name || !stream_url || !stream_type) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from("streams")
      .insert([
        {
          location_name,
          stream_url,
          stream_type,
          status: "active",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: error.message || "Failed to create stream" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

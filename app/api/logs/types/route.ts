import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all distinct log types from the database
    const logTypes = await prisma.log.findMany({
      select: {
        type: true,
      },
      distinct: ["type"],
      orderBy: {
        type: "asc",
      },
    });

    // Get count for each log type
    const logTypeCounts = await prisma.log.groupBy({
      by: ["type"],
      _count: {
        type: true,
      },
    });

    // Combine the data
    const typesWithCounts = logTypes.map((logType: any) => {
      const countData = logTypeCounts.find(
        (count: any) => count.type === logType.type
      );
      return {
        type: logType.type,
        count: countData?._count.type || 0,
      };
    });

    // Add predefined log types that might not exist in the database yet
    const predefinedTypes = ["INFO", "SUCCESS", "WARNING", "ERROR"];
    const existingTypes = typesWithCounts.map((t: any) => t.type);

    predefinedTypes.forEach((type) => {
      if (!existingTypes.includes(type)) {
        typesWithCounts.push({
          type,
          count: 0,
        });
      }
    });

    // Sort by type name
    typesWithCounts.sort((a: any, b: any) =>
      (a.type || "").localeCompare(b.type || "")
    );

    return NextResponse.json({
      types: typesWithCounts,
      total: typesWithCounts.length,
    });
  } catch (error) {
    console.error("Error fetching log types:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

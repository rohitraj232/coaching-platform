
import { NextRequest, NextResponse } from "next/server";

import { requireStudentApi } from "@/lib/auth/require-student-api";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
    try {
        // 1. Verify student authentication and account status.
        const { response, profile } = await requireStudentApi();

        if (response) return response;

        if (!profile) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Student profile not found.",
                },
                { status: 403 }
            );
        }

        // 2. Read search parameter.
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get("search")?.trim() || "";

        // 3. Create Supabase admin client.
        const supabase = createAdminClient();

        // 4. Fetch published materials for student's class.
        let query = supabase
            .from("study_materials")
            .select(
                "id, title, description, class_level, subject, chapter, file_name, file_size, mime_type, created_at"
            )
            .eq("class_level", profile.class_level)
            .eq("is_published", true)
            .order("subject", { ascending: true })
            .order("created_at", { ascending: false });

        // 5. Apply search filter.
        if (search) {
            const safeSearch = search.replace(/[,%()]/g, " ").trim();

            if (safeSearch) {
                query = query.or(
                    `title.ilike.%${safeSearch}%,subject.ilike.%${safeSearch}%,chapter.ilike.%${safeSearch}%`
                );
            }
        }

        const { data: materials, error } = await query;

        if (error) {
            console.error("Student study materials fetch error:", error);

            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to fetch study materials.",
                },
                { status: 500 }
            );
        }

        // 6. Return materials.
        return NextResponse.json({
            success: true,
            classLevel: profile.class_level,
            total: materials?.length || 0,
            materials: materials || [],
        });

    } catch (error) {
        console.error("Student study materials API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error.",
            },
            { status: 500 }
        );
    }
}

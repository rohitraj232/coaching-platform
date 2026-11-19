
import { NextResponse } from "next/server";

import { requireStudentApi } from "@/lib/auth/require-student-api";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
    request: Request,
    context: { params: Promise<{ materialId: string }> }
) {
    try {
        // 1. Authenticate student.
        const { response, profile } = await requireStudentApi();

        if (response) return response;

        if (!profile) {
            return NextResponse.json(
                { success: false, message: "Student profile not found." },
                { status: 403 }
            );
        }

        // 2. Validate material ID.
        const { materialId } = await context.params;

        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(materialId)) {
            return NextResponse.json(
                { success: false, message: "Invalid material ID." },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // 3. Fetch material belonging to student's class.
        const { data: material, error } = await supabase
            .from("study_materials")
            .select("id, title, file_path, file_name, class_level, is_published")
            .eq("id", materialId)
            .eq("class_level", profile.class_level)
            .eq("is_published", true)
            .maybeSingle();

        if (error) {
            console.error("Study material fetch error:", error);

            return NextResponse.json(
                { success: false, message: "Unable to fetch study material." },
                { status: 500 }
            );
        }

        if (!material) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Study material not found or access denied.",
                },
                { status: 404 }
            );
        }

        // 4. Generate a short-lived signed URL.
        const { data: signedUrlData, error: signedUrlError } =
            await supabase.storage
                .from("study-materials")
                .createSignedUrl(material.file_path, 60);

        if (signedUrlError || !signedUrlData?.signedUrl) {
            console.error("Signed URL error:", signedUrlError);

            return NextResponse.json(
                { success: false, message: "Unable to generate PDF link." },
                { status: 500 }
            );
        }

        // 5. Return signed URL.
        return NextResponse.json({
            success: true,
            material: {
                id: material.id,
                title: material.title,
                fileName: material.file_name,
                url: signedUrlData.signedUrl,
                expiresIn: 60,
            },
        });

    } catch (error) {
        console.error("Study material download API error:", error);

        return NextResponse.json(
            { success: false, message: "Internal server error." },
            { status: 500 }
        );
    }
}

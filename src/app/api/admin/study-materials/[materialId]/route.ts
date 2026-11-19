
import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

type RouteContext = {
    params: Promise<{
        materialId: string;
    }>;
};

const ALLOWED_CLASSES = ["8", "9", "10", "11", "12"];

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
    request: NextRequest,
    context: RouteContext
) {
    try {
        // Admin authentication
        const { response } = await requireAdminApi();

        if (response) return response;

        // Get material ID
        const { materialId } = await context.params;

        if (!UUID_REGEX.test(materialId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid material ID.",
                },
                { status: 400 }
            );
        }

        // Parse request body
        let body;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid request body.",
                },
                { status: 400 }
            );
        }

        const title = String(body.title || "").trim();
        const description = String(body.description || "").trim();
        const classLevel = String(body.classLevel || "").trim();
        const subject = String(body.subject || "").trim();
        const chapter = String(body.chapter || "").trim();

        // Required validation
        if (!title || !classLevel || !subject) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Title, class and subject are required.",
                },
                { status: 400 }
            );
        }

        // Length validation
        if (
            title.length > 255 ||
            subject.length > 100 ||
            chapter.length > 255 ||
            description.length > 5000
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "One or more fields exceed the allowed length.",
                },
                { status: 400 }
            );
        }

        // Class validation
        if (!ALLOWED_CLASSES.includes(classLevel)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid class selected.",
                },
                { status: 400 }
            );
        }

        const supabase = createAdminClient();

        // Update material
        const { data, error } = await supabase
            .from("study_materials")
            .update({
                title,
                description: description || null,
                class_level: classLevel,
                subject,
                chapter: chapter || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", materialId)
            .select("*")
            .maybeSingle();

        if (error) {
            console.error("Study material update error:", error);

            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to update study material.",
                    error: error.message,
                },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Study material not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Study material updated successfully.",
            material: data,
        });
    } catch (error) {
        console.error("Study material PATCH error:", error);

        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal server error.",
            },
            { status: 500 }
        );
    }
}


export async function DELETE(
    request: Request,
    context: { params: Promise<{ materialId: string }> }
) {
    try {
        // 1. Verify admin authentication.
        const { response } = await requireAdminApi();

        if (response) return response;

        // 2. Get and validate material ID.
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

        // 3. Fetch material details.
        const { data: material, error: fetchError } = await supabase
            .from("study_materials")
            .select("id, title, file_path")
            .eq("id", materialId)
            .maybeSingle();

        if (fetchError) {
            console.error("Fetch material error:", fetchError);

            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to fetch study material.",
                    details: fetchError.message,
                },
                { status: 500 }
            );
        }

        if (!material) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Study material not found.",
                },
                { status: 404 }
            );
        }

        // 4. Delete PDF from Supabase Storage.
        const { error: storageError } = await supabase.storage
            .from("study-materials")
            .remove([material.file_path]);

        if (storageError) {
            console.error("Storage deletion error:", storageError);

            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to delete the PDF file from storage.",
                    details: storageError.message,
                },
                { status: 500 }
            );
        }

        // 5. Delete database record with retry support.
        let deleteError: { message: string } | null = null;
        let deleted = false;

        for (let attempt = 1; attempt <= 3; attempt++) {
            const { data, error } = await supabase
                .from("study_materials")
                .delete()
                .eq("id", materialId)
                .select("id");

            if (!error) {
                deleted = true;

                console.log(
                    `Study material database deletion completed. Attempt: ${attempt}`
                );

                break;
            }

            deleteError = error;

            console.error(
                `Database deletion attempt ${attempt} failed:`,
                error
            );

            if (attempt < 3) {
                await new Promise((resolve) =>
                    setTimeout(resolve, 1000)
                );
            }
        }

        if (!deleted) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "PDF was deleted from storage, but database deletion failed after 3 attempts.",
                    details: deleteError?.message,
                    storageDeleted: true,
                    databaseDeleted: false,
                },
                { status: 500 }
            );
        }

        // 6. Success response.
        return NextResponse.json({
            success: true,
            message: "Study material deleted successfully.",
            materialId,
            title: material.title,
        });

    } catch (error) {
        console.error("Delete study material error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error while deleting study material.",
            },
            { status: 500 }
        );
    }
}


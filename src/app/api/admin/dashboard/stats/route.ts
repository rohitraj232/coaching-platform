
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
    try {
        // 1. Verify logged-in user
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        const supabase = createAdminClient();

        // 2. Verify admin role
        const { data: admin, error: adminError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (adminError || admin?.role !== "admin") {
            return NextResponse.json(
                { success: false, message: "Forbidden" },
                { status: 403 }
            );
        }

        // 3. Fetch dashboard counts
        const [
            totalStudentsResult,
            activeStudentsResult,
            inactiveStudentsResult,
            totalQuizzesResult,
            publishedQuizzesResult,
            totalAttemptsResult,
            classCountsResult,
            recentStudentsResult,
            completedAttemptsResult,
            recentAttemptsResult,
        ] = await Promise.all([
            // Total students
            supabase
                .from("profiles")
                .select("id", { count: "exact", head: true })
                .eq("role", "student"),

            // Active students
            supabase
                .from("profiles")
                .select("id", { count: "exact", head: true })
                .eq("role", "student")
                .eq("is_active", true),

            // Inactive students
            supabase
                .from("profiles")
                .select("id", { count: "exact", head: true })
                .eq("role", "student")
                .eq("is_active", false),

            // Total quizzes
            supabase
                .from("quizzes")
                .select("id", { count: "exact", head: true }),

            // Published quizzes
            supabase
                .from("quizzes")
                .select("id", { count: "exact", head: true })
                .eq("is_published", true),

            // Total attempts
            supabase
                .from("quiz_attempts")
                .select("id", { count: "exact", head: true }),

            // Class-wise student counts
            supabase
                .from("profiles")
                .select("class_level")
                .eq("role", "student"),

            // Recent registrations
            supabase
                .from("profiles")
                .select("id, full_name, phone, class_level, created_at, is_active")
                .eq("role", "student")
                .order("created_at", { ascending: false })
                .limit(5),

            // Submitted attempts with quiz passing marks
            supabase
                .from("quiz_attempts")
                .select(`
                    score,
                    total_marks,
                    quizzes (
                    passing_marks
                    )
                `)
                .not("submitted_at", "is", null),

            // Recent quiz activity
            supabase
                .from("quiz_attempts")
                .select(`
                    id,
                    student_id,
                    quiz_id,
                    score,
                    total_marks,
                    status,
                    started_at,
                    submitted_at,
                    profiles!quiz_attempts_student_id_fkey (
                    full_name
                    ),
                    quizzes (
                    title
                    )
                `)
                .order("started_at", { ascending: false })
                .limit(5),
        ]);


        // 4. Check database errors with query names
        const queryResults = [
            { name: "totalStudents", result: totalStudentsResult },
            { name: "activeStudents", result: activeStudentsResult },
            { name: "inactiveStudents", result: inactiveStudentsResult },
            { name: "totalQuizzes", result: totalQuizzesResult },
            { name: "publishedQuizzes", result: publishedQuizzesResult },
            { name: "totalAttempts", result: totalAttemptsResult },
            { name: "classCounts", result: classCountsResult },
            { name: "recentStudents", result: recentStudentsResult },
            { name: "completedAttempts", result: completedAttemptsResult },
            { name: "recentAttempts", result: recentAttemptsResult },
        ];

        const queryErrors = queryResults
            .filter(({ result }) => result.error)
            .map(({ name, result }) => ({
                query: name,
                error: {
                    message: result.error?.message,
                    code: result.error?.code,
                    details: result.error?.details,
                    hint: result.error?.hint,
                },
            }));

        if (queryErrors.length > 0) {
            console.error("Dashboard query errors:", queryErrors);

            return NextResponse.json(
                {
                    success: false,
                    message: "Unable to fetch dashboard statistics",
                    errors: queryErrors,
                },
                { status: 500 }
            );
        }




        // 5. Calculate class-wise counts
        const classWiseStudents = Array.from(
            { length: 12 },
            (_, index) => ({
                classLevel: String(index + 1),
                total: 0,
            })
        );

        (classCountsResult.data || []).forEach((student) => {
            const classLevel = Number(student.class_level);

            if (classLevel >= 1 && classLevel <= 12) {
                classWiseStudents[classLevel - 1].total++;
            }
        });


        // 6. Calculate quiz performance analytics
        const submittedAttempts = completedAttemptsResult.data || [];

        const validAttempts = submittedAttempts.filter(
            (attempt) =>
                Number(attempt.total_marks) > 0 &&
                attempt.score !== null
        );

        const averageScore =
            validAttempts.length > 0
                ? Number(
                    (
                        validAttempts.reduce(
                            (total, attempt) =>
                                total +
                                (Number(attempt.score) /
                                    Number(attempt.total_marks)) *
                                100,
                            0
                        ) / validAttempts.length
                    ).toFixed(2)
                )
                : 0;

        // Pass/fail calculation using each quiz's passing marks
        const passedAttempts = validAttempts.filter((attempt) => {
            const quiz = Array.isArray(attempt.quizzes)
                ? attempt.quizzes[0]
                : attempt.quizzes;

            return (
                quiz &&
                Number(attempt.score) >= Number(quiz.passing_marks)
            );
        });

        const failedAttempts =
            validAttempts.length - passedAttempts.length;

        const passPercentage =
            validAttempts.length > 0
                ? Number(
                    (
                        (passedAttempts.length / validAttempts.length) *
                        100
                    ).toFixed(2)
                )
                : 0;


        // 7. Return dashboard statistics
        return NextResponse.json({
            success: true,
            stats: {
                totalStudents: totalStudentsResult.count || 0,
                activeStudents: activeStudentsResult.count || 0,
                inactiveStudents: inactiveStudentsResult.count || 0,

                totalQuizzes: totalQuizzesResult.count || 0,
                publishedQuizzes: publishedQuizzesResult.count || 0,

                totalAttempts: totalAttemptsResult.count || 0,
                averageScore,

                submittedAttempts: validAttempts.length,
                passedAttempts: passedAttempts.length,
                failedAttempts,
                passPercentage,
            },

            classWiseStudents,

            recentStudents: recentStudentsResult.data || [],

            recentQuizActivity: recentAttemptsResult.data || [],
        });
    } catch (error) {
        console.error("Dashboard stats API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 }
        );
    }
}

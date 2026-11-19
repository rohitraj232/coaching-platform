
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    quizId: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  try {
    // 1. Authenticate student
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const { quizId } = await context.params;
    const supabase = createAdminClient();

    // 2. Verify student role
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

    if (profileError || !profile || profile.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Student access required." },
        { status: 403 }
      );
    }

    // 3. Verify quiz is published
    const { data: quiz, error: quizError } =
      await supabase
        .from("quizzes")
        .select("id, title, is_published")
        .eq("id", quizId)
        .maybeSingle();

    if (quizError) {
      console.error("Leaderboard Quiz Error:", quizError);

      return NextResponse.json(
        { success: false, message: "Unable to load quiz." },
        { status: 500 }
      );
    }

    if (!quiz || !quiz.is_published) {
      return NextResponse.json(
        { success: false, message: "Quiz not found." },
        { status: 404 }
      );
    }

    // 4. Fetch all evaluated attempts
    const { data: attempts, error: attemptsError } =
      await supabase
        .from("quiz_attempts")
        .select("student_id, score, submitted_at")
        .eq("quiz_id", quizId)
        .eq("status", "evaluated")
        .not("score", "is", null)
        .order("score", { ascending: false })
        .order("submitted_at", { ascending: true });

    if (attemptsError) {
      console.error("Leaderboard Attempts Error:", attemptsError);

      return NextResponse.json(
        { success: false, message: "Unable to load leaderboard." },
        { status: 500 }
      );
    }

    const allAttempts = attempts || [];

    if (allAttempts.length === 0) {
      return NextResponse.json({
        success: true,
        leaderboard: [],
        myRank: null,
        myEntry: null,
        totalParticipants: 0,
      });
    }

    // 5. Fetch only display names
    const studentIds = [
      ...new Set(allAttempts.map((attempt) => attempt.student_id)),
    ];

    const { data: students, error: studentsError } =
      await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", studentIds);

    if (studentsError) {
      console.error("Leaderboard Students Error:", studentsError);

      return NextResponse.json(
        { success: false, message: "Unable to load student names." },
        { status: 500 }
      );
    }

    const studentMap = new Map(
      (students || []).map((student) => [
        student.id,
        student.full_name,
      ])
    );

    // 6. Calculate ranks
    let currentRank = 0;
    let previousScore: number | null = null;

    const rankedAttempts = allAttempts.map((attempt, index) => {
      const score = Number(attempt.score);

      if (previousScore === null || score !== previousScore) {
        currentRank = index + 1;
      }

      previousScore = score;

      return {
        rank: currentRank,
        studentId: attempt.student_id,
        studentName:
          studentMap.get(attempt.student_id) || "Student",
        score,
        submittedAt: attempt.submitted_at,
      };
    });

    // 7. Get current student's rank
    const myEntry =
      rankedAttempts.find(
        (entry) => entry.studentId === user.id
      ) || null;

    // 8. Return top 100 and current student's entry
    const leaderboard = rankedAttempts
      .slice(0, 100)
      .map(({ studentId, ...entry }) => entry);

    const safeMyEntry = myEntry
      ? {
          rank: myEntry.rank,
          studentName: myEntry.studentName,
          score: myEntry.score,
          submittedAt: myEntry.submittedAt,
        }
      : null;

    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        title: quiz.title,
      },
      leaderboard,
      myRank: myEntry?.rank ?? null,
      myEntry: safeMyEntry,
      totalParticipants: rankedAttempts.length,
    });
  } catch (error) {
    console.error("Leaderboard API Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to load leaderboard.",
      },
      { status: 500 }
    );
  }
}

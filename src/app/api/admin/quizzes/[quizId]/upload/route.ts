import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ExcelQuestion = {
  question_code: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  marks: number;
  negative_marks: number;
};

const REQUIRED_COLUMNS = [
  "question_code",
  "question",
  "option_a",
  "option_b",
  "option_c",
  "option_d",
  "correct_option",
  "marks",
  "negative_marks",
];

function readExcel(buffer: ArrayBuffer): ExcelQuestion[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

  if (!firstSheet) {
    throw new Error("Excel file does not contain a worksheet.");
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    firstSheet,
    { defval: "" }
  );

  if (rows.length === 0) {
    throw new Error("Excel file is empty.");
  }

  const normalizedRows = rows.map((row) => {
    const normalized: Record<string, unknown> = {};

    Object.entries(row).forEach(([key, value]) => {
      normalized[key.trim().toLowerCase()] = value;
    });

    return normalized;
  });

  const headers = Object.keys(normalizedRows[0]);

  const missingColumns = REQUIRED_COLUMNS.filter(
    (column) => !headers.includes(column)
  );

  if (missingColumns.length) {
    throw new Error(
      `Missing columns: ${missingColumns.join(", ")}`
    );
  }

  if (normalizedRows.length > 500) {
    throw new Error("Maximum 500 questions can be uploaded at once.");
  }

  return normalizedRows.map((row, index) => {
    const rowNumber = index + 2;

    const text = (key: string) => String(row[key] ?? "").trim();

    const question: ExcelQuestion = {
      question_code: text("question_code"),
      question: text("question"),
      option_a: text("option_a"),
      option_b: text("option_b"),
      option_c: text("option_c"),
      option_d: text("option_d"),
      correct_option: text("correct_option").toUpperCase(),
      marks: Number(row.marks),
      negative_marks: Number(row.negative_marks),
    };

    if (
      !question.question_code ||
      !question.question ||
      !question.option_a ||
      !question.option_b ||
      !question.option_c ||
      !question.option_d
    ) {
      throw new Error(`Missing required content in Excel row ${rowNumber}.`);
    }

    if (!["A", "B", "C", "D"].includes(question.correct_option)) {
      throw new Error(`Invalid correct option in row ${rowNumber}.`);
    }

    if (
      !Number.isFinite(question.marks) ||
      question.marks <= 0 ||
      !Number.isFinite(question.negative_marks) ||
      question.negative_marks < 0
    ) {
      throw new Error(`Invalid marks in row ${rowNumber}.`);
    }

    return question;
  });
}

function validateMatchingFiles(
  english: ExcelQuestion[],
  hindi: ExcelQuestion[]
) {
  const englishMap = new Map<string, ExcelQuestion>();
  const hindiMap = new Map<string, ExcelQuestion>();

  for (const question of english) {
    if (englishMap.has(question.question_code)) {
      throw new Error(
        `Duplicate English question code: ${question.question_code}`
      );
    }

    englishMap.set(question.question_code, question);
  }

  for (const question of hindi) {
    if (hindiMap.has(question.question_code)) {
      throw new Error(
        `Duplicate Hindi question code: ${question.question_code}`
      );
    }

    hindiMap.set(question.question_code, question);
  }

  if (englishMap.size !== hindiMap.size) {
    throw new Error("English and Hindi files have different question counts.");
  }

  for (const [code, englishQuestion] of englishMap) {
    const hindiQuestion = hindiMap.get(code);

    if (!hindiQuestion) {
      throw new Error(`Question code ${code} is missing in Hindi file.`);
    }

    if (
      englishQuestion.correct_option !== hindiQuestion.correct_option ||
      englishQuestion.marks !== hindiQuestion.marks ||
      englishQuestion.negative_marks !== hindiQuestion.negative_marks
    ) {
      throw new Error(
        `Correct option or marks mismatch for question ${code}.`
      );
    }
  }

  for (const code of hindiMap.keys()) {
    if (!englishMap.has(code)) {
      throw new Error(`Question code ${code} is missing in English file.`);
    }
  }

  return english;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    const { quizId } = await params;

    const supabase = createAdminClient();

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const englishFile = formData.get("englishFile");
    const hindiFile = formData.get("hindiFile");

    if (!(englishFile instanceof File) || !(hindiFile instanceof File)) {
      return NextResponse.json(
        { success: false, message: "Both Excel files are required." },
        { status: 400 }
      );
    }

    if (
      !englishFile.name.toLowerCase().endsWith(".xlsx") ||
      !hindiFile.name.toLowerCase().endsWith(".xlsx")
    ) {
      return NextResponse.json(
        { success: false, message: "Only .xlsx files are supported." },
        { status: 400 }
      );
    }

    if (
      englishFile.size === 0 ||
      hindiFile.size === 0 ||
      englishFile.size > 5 * 1024 * 1024 ||
      hindiFile.size > 5 * 1024 * 1024
    ) {
      return NextResponse.json(
        { success: false, message: "Each file must be between 1 byte and 5 MB." },
        { status: 400 }
      );
    }

    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .select("id, is_published")
      .eq("id", quizId)
      .maybeSingle();

    if (quizError || !quiz || quiz.is_published) {
      return NextResponse.json(
        { success: false, message: "Draft quiz not found." },
        { status: 404 }
      );
    }

    const english = readExcel(await englishFile.arrayBuffer());
    const hindi = readExcel(await hindiFile.arrayBuffer());

    const matchedEnglish = validateMatchingFiles(english, hindi);
    const hindiMap = new Map(
      hindi.map((question) => [question.question_code, question])
    );

    const questions = matchedEnglish.map((en, index) => {
      const hi = hindiMap.get(en.question_code)!;

      return {
        question_code: en.question_code,
        question_order: index + 1,
        marks: en.marks,
        negative_marks: en.negative_marks,
        correct_option: en.correct_option,
        en: {
          question: en.question,
          option_a: en.option_a,
          option_b: en.option_b,
          option_c: en.option_c,
          option_d: en.option_d,
        },
        hi: {
          question: hi.question,
          option_a: hi.option_a,
          option_b: hi.option_b,
          option_c: hi.option_c,
          option_d: hi.option_d,
        },
      };
    });

    const { data: importedCount, error: importError } = await supabase.rpc(
      "import_quiz_questions",
      {
        p_quiz_id: quizId,
        p_questions: questions,
      }
    );

    if (importError) {
      console.error("Question import error:", importError.message);

      return NextResponse.json(
        { success: false, message: importError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${importedCount} questions imported successfully.`,
      importedCount,
    });
  } catch (error) {
    console.error("Excel upload error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to process Excel files.",
      },
      { status: 400 }
    );
  }
}
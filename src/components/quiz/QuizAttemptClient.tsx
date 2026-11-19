
// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   FaArrowLeft,
//   FaArrowRight,
//   FaCheckCircle,
//   FaClock,
//   FaFlag,
//   FaPaperPlane,
// } from "react-icons/fa";

// type Option = "A" | "B" | "C" | "D";

// type QuizQuestion = {
//   id: string;
//   questionText: string;
//   questionCode: string;
//   questionOrder: number;
//   marks: number;
//   options: {
//     A: string;
//     B: string;
//     C: string;
//     D: string;
//   };
//   selectedOption: Option | null;
// };

// type Props = {
//   quizId: string;
//   attemptId: string;
// };

// export default function QuizAttemptClient({
//   quizId,
//   attemptId,
// }: Props) {
//   const router = useRouter();

//   const [questions, setQuestions] = useState<QuizQuestion[]>([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [remainingSeconds, setRemainingSeconds] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [warning, setWarning] = useState("");

//   const submitStarted = useRef(false);
//   const currentQuestion = questions[currentIndex];

//   const answeredCount = questions.filter(
//     (question) => question.selectedOption !== null
//   ).length;

//   const formatTime = (seconds: number) => {
//     const minutes = Math.floor(seconds / 60);
//     const remaining = seconds % 60;

//     return `${String(minutes).padStart(2, "0")}:${String(
//       remaining
//     ).padStart(2, "0")}`;
//   };

//   // Load questions and previously saved answers.
//   useEffect(() => {
//     let active = true;

//     async function loadQuestions() {
//       try {
//         setLoading(true);
//         setError("");

//         const response = await fetch(
//           `/api/quizzes/${quizId}/attempts/${attemptId}/questions`,
//           { cache: "no-store" }
//         );

//         const result = await response.json();

//         if (!response.ok || !result.success) {
//           throw new Error(result.message || "Unable to load quiz.");
//         }

//         if (!active) return;

//         setQuestions(result.questions);
//         setRemainingSeconds(result.remainingSeconds);
//       } catch (err) {
//         if (active) {
//           setError(
//             err instanceof Error ? err.message : "Unable to load quiz."
//           );
//         }
//       } finally {
//         if (active) setLoading(false);
//       }
//     }

//     loadQuestions();

//     return () => {
//       active = false;
//     };
//   }, [quizId, attemptId]);

//   // Submit quiz only once from this browser instance.
//   const submitQuiz = useCallback(
//     async (reason?: string) => {
//       if (submitStarted.current) return;

//       submitStarted.current = true;
//       setSubmitting(true);
//       setWarning("");

//       try {
//         const response = await fetch(
//           `/api/quizzes/${quizId}/attempts/${attemptId}/submit`,
//           { method: "POST" }
//         );

//         const result = await response.json();

//         if (!response.ok || !result.success) {
//           throw new Error(result.message || "Submission failed.");
//         }

//         router.replace(
//           `/quiz/${quizId}/result/${attemptId}`
//         );
//         router.refresh();
//       } catch (err) {
//         submitStarted.current = false;
//         setSubmitting(false);

//         setError(
//           err instanceof Error
//             ? err.message
//             : "Unable to submit quiz."
//         );
//       }
//     },
//     [quizId, attemptId, router]
//   );

//   // Countdown timer.
//   useEffect(() => {
//     if (loading || error || submitting || remainingSeconds <= 0) {
//       return;
//     }

//     const timer = window.setInterval(() => {
//       setRemainingSeconds((previous) => {
//         if (previous <= 1) {
//           window.clearInterval(timer);
//           return 0;
//         }

//         return previous - 1;
//       });
//     }, 1000);

//     return () => window.clearInterval(timer);
//   }, [loading, error, submitting, remainingSeconds]);

//   useEffect(() => {
//     if (!loading && remainingSeconds === 0 && questions.length > 0) {
//       submitQuiz("time_expired");
//     }
//   }, [loading, remainingSeconds, questions.length, submitQuiz]);

//   // Detect page becoming hidden and record a tab switch.
//   useEffect(() => {
//     if (loading || error || submitting) return;

//     let requestInProgress = false;

//     const handleVisibilityChange = async () => {
//       if (document.visibilityState !== "hidden") return;
//       if (requestInProgress || submitStarted.current) return;

//       requestInProgress = true;

//       try {
//         const response = await fetch(
//           `/api/quizzes/${quizId}/attempts/${attemptId}/tab-switch`,
//           { method: "POST" }
//         );

//         const result = await response.json();

//         if (result.expired || result.shouldSubmit) {
//           await submitQuiz(
//             result.expired ? "time_expired" : "tab_switch_limit"
//           );
//           return;
//         }

//         if (result.success) {
//           const count = result.tabSwitchCount;

//           if (count === 1) {
//             setWarning(
//               "Warning 1: You left the quiz screen. Please stay on this page."
//             );
//           } else if (count === 2) {
//             setWarning(
//               "Final warning: One more detected switch will submit your quiz."
//             );
//           }
//         } else if (response.status !== 409) {
//           setError(result.message || "Unable to record tab switch.");
//         }
//       } catch {
//         setError("Unable to record tab switch. Please check your connection.");
//       } finally {
//         requestInProgress = false;
//       }
//     };

//     document.addEventListener("visibilitychange", handleVisibilityChange);

//     return () => {
//       document.removeEventListener(
//         "visibilitychange",
//         handleVisibilityChange
//       );
//     };
//   }, [loading, error, submitting, quizId, attemptId, submitQuiz]);

//   // Save selected answer.
//   const selectAnswer = async (option: Option) => {
//     if (!currentQuestion || saving || submitting) return;

//     const questionId = currentQuestion.id;
//     const previousAnswer = currentQuestion.selectedOption;

//     if (previousAnswer === option) return;

//     setQuestions((previous) =>
//       previous.map((question) =>
//         question.id === questionId
//           ? { ...question, selectedOption: option }
//           : question
//       )
//     );

//     setSaving(true);
//     setError("");

//     try {
//       const response = await fetch(
//         `/api/quizzes/${quizId}/attempts/${attemptId}/answers`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             questionId,
//             selectedOption: option,
//           }),
//         }
//       );

//       const result = await response.json();

//       if (!response.ok || !result.success) {
//         throw new Error(result.message || "Unable to save answer.");
//       }
//     } catch (err) {
//       setQuestions((previous) =>
//         previous.map((question) =>
//           question.id === questionId
//             ? { ...question, selectedOption: previousAnswer }
//             : question
//         )
//       );

//       setError(
//         err instanceof Error ? err.message : "Unable to save answer."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-slate-50">
//         <p className="text-slate-600">Loading your quiz...</p>
//       </main>
//     );
//   }

//   if (error && questions.length === 0) {
//     return (
//       <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
//         <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
//           <p className="text-red-600">{error}</p>
//           <button
//             onClick={() => router.refresh()}
//             className="mt-5 rounded-lg bg-blue-900 px-5 py-2 text-white"
//           >
//             Try Again
//           </button>
//         </div>
//       </main>
//     );
//   }

//   if (!currentQuestion) {
//     return <p className="p-8 text-center">No questions available.</p>;
//   }

//   return (
//     <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6">
//       <div className="mx-auto max-w-6xl">

//         {/* Header */}
//         <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm">
//           <div>
//             <h1 className="text-lg font-bold text-slate-900">
//               Online Examination
//             </h1>
//             <p className="text-sm text-slate-500">
//               Answer all questions carefully.
//             </p>
//           </div>

//           <div className="flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-orange-700">
//             <FaClock />
//             <span className="font-bold tabular-nums">
//               {formatTime(remainingSeconds)}
//             </span>
//           </div>
//         </div>

//         {/* Warning */}
//         {warning && (
//           <div className="mb-5 rounded-xl border border-orange-300 bg-orange-50 p-4 text-sm font-medium text-orange-800">
//             {warning}
//           </div>
//         )}

//         {error && (
//           <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">

//           {/* Question area */}
//           <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
//             <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
//               <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900">
//                 Question {currentIndex + 1} of {questions.length}
//               </span>

//               <span className="text-sm text-slate-500">
//                 Marks: {currentQuestion.marks}
//               </span>
//             </div>

//             <h2 className="mb-8 text-lg font-semibold leading-8 text-slate-900">
//               {currentQuestion.questionText}
//             </h2>

//             <div className="space-y-3">
//               {(["A", "B", "C", "D"] as Option[]).map((option) => {
//                 const selected =
//                   currentQuestion.selectedOption === option;

//                 return (
//                   <button
//                     key={option}
//                     type="button"
//                     disabled={saving || submitting}
//                     onClick={() => selectAnswer(option)}
//                     className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${
//                       selected
//                         ? "border-blue-900 bg-blue-50"
//                         : "border-slate-200 hover:border-blue-400"
//                     }`}
//                   >
//                     <span
//                       className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
//                         selected
//                           ? "bg-blue-900 text-white"
//                           : "bg-slate-100 text-slate-700"
//                       }`}
//                     >
//                       {option}
//                     </span>

//                     <span className="pt-1 text-sm text-slate-800">
//                       {currentQuestion.options[option]}
//                     </span>

//                     {selected && (
//                       <FaCheckCircle className="ml-auto mt-1 text-blue-900" />
//                     )}
//                   </button>
//                 );
//               })}
//             </div>

//             <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
//               <button
//                 type="button"
//                 disabled={currentIndex === 0 || saving || submitting}
//                 onClick={() => setCurrentIndex((index) => index - 1)}
//                 className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-40"
//               >
//                 <FaArrowLeft />
//                 Previous
//               </button>

//               {currentIndex < questions.length - 1 ? (
//                 <button
//                   type="button"
//                   disabled={saving || submitting}
//                   onClick={() => setCurrentIndex((index) => index + 1)}
//                   className="flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
//                 >
//                   Next
//                   <FaArrowRight />
//                 </button>
//               ) : (
//                 <button
//                   type="button"
//                   disabled={saving || submitting}
//                   onClick={() => submitQuiz("manual_submission")}
//                   className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
//                 >
//                   <FaPaperPlane />
//                   Submit Quiz
//                 </button>
//               )}
//             </div>

//             {saving && (
//               <p className="mt-3 text-right text-xs text-slate-500">
//                 Saving answer...
//               </p>
//             )}
//           </section>

//           {/* Question palette */}
//           <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">
//             <h3 className="mb-4 font-bold text-slate-900">
//               Question Palette
//             </h3>

//             <div className="mb-5 grid grid-cols-5 gap-2">
//               {questions.map((question, index) => {
//                 const isCurrent = currentIndex === index;
//                 const isAnswered = question.selectedOption !== null;

//                 return (
//                   <button
//                     key={question.id}
//                     type="button"
//                     onClick={() => setCurrentIndex(index)}
//                     className={`flex h-10 items-center justify-center rounded-lg text-sm font-semibold ${
//                       isCurrent
//                         ? "bg-blue-900 text-white ring-2 ring-blue-300"
//                         : isAnswered
//                         ? "bg-green-100 text-green-800"
//                         : "bg-slate-100 text-slate-700"
//                     }`}
//                   >
//                     {index + 1}
//                   </button>
//                 );
//               })}
//             </div>

//             <div className="space-y-3 border-t border-slate-100 pt-4 text-sm">
//               <div className="flex items-center justify-between">
//                 <span className="text-slate-600">Total questions</span>
//                 <strong>{questions.length}</strong>
//               </div>

//               <div className="flex items-center justify-between">
//                 <span className="text-slate-600">Answered</span>
//                 <strong className="text-green-700">{answeredCount}</strong>
//               </div>

//               <div className="flex items-center justify-between">
//                 <span className="text-slate-600">Not answered</span>
//                 <strong className="text-red-600">
//                   {questions.length - answeredCount}
//                 </strong>
//               </div>
//             </div>

//             <button
//               type="button"
//               disabled={saving || submitting}
//               onClick={() => submitQuiz("manual_submission")}
//               className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white disabled:opacity-50"
//             >
//               <FaFlag />
//               Submit Test
//             </button>
//           </aside>
//         </div>

//         {submitting && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
//             <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
//               <p className="text-lg font-bold text-slate-900">
//                 Submitting your quiz...
//               </p>
//               <p className="mt-2 text-sm text-slate-500">
//                 Please don't close this page.
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </main>
//   );
// }



"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  FiAlertTriangle,
  FiBookOpen,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiLoader,
  FiSend,
} from "react-icons/fi";

type Option = "A" | "B" | "C" | "D";

interface QuizQuestion {
  id: string;
  questionCode: string;
  questionOrder: number;
  questionText: string;
  marks: number;
  negativeMarks: number;
  options: Record<Option, string>;
  selectedOption: Option | null;
}

interface QuizAttemptClientProps {
  quizId: string;
  attemptId: string;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(
    remaining
  ).padStart(2, "0")}`;
}

function getMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "Something went wrong.";
}

export default function QuizAttemptClient({
  quizId,
  attemptId,
}: QuizAttemptClientProps) {
  const router = useRouter();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<
    Record<string, Option | null>
  >({});

  const [currentIndex, setCurrentIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [language, setLanguage] = useState<"en" | "hi">("en");

  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(
    null
  );

  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [maxTabSwitches, setMaxTabSwitches] = useState(3);

  const [saveStatus, setSaveStatus] = useState("Loading answers...");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent duplicate submissions.
  const submittingRef = useRef(false);

  // Prevent duplicate visibility events while already hidden.
  const wasHiddenRef = useRef(false);

  // Serialize answer requests so rapid selections cannot save out of order.
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const resultUrl = `/quiz/${quizId}/result/${attemptId}`;

  const questionsUrl =
    `/api/quizzes/${quizId}/attempts/${attemptId}/questions`;

  const answersUrl =
    `/api/quizzes/${quizId}/attempts/${attemptId}/answers`;

  const submitUrl =
    `/api/quizzes/${quizId}/attempts/${attemptId}/submit`;

  const tabSwitchUrl =
    `/api/quizzes/${quizId}/attempts/${attemptId}/tab-switch`;

  // -------------------------------------------------------
  // 1. Submit quiz
  // -------------------------------------------------------

  const submitQuiz = useCallback(async () => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setError("");
    setNotice("Submitting your quiz...");

    try {
      // Wait for pending answer requests before submission.
      await saveQueueRef.current.catch(() => undefined);

      const response = await fetch(submitUrl, {
        method: "POST",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 409 && data.result) {
          router.replace(resultUrl);
          return;
        }

        throw new Error(
          data.message || "Unable to submit quiz."
        );
      }

      // The result page is implemented in Module 3.6.4.
      router.replace(resultUrl);
    } catch (error) {
      submittingRef.current = false;
      setIsSubmitting(false);
      setNotice("");
      setError(getMessage(error));
    }
  }, [submitUrl, resultUrl, router]);

  // -------------------------------------------------------
  // 2. Load questions and saved answers
  // -------------------------------------------------------

  useEffect(() => {
    let active = true;

    async function loadQuestions() {
      try {
        const response = await fetch(questionsUrl, {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (
          response.status === 409 &&
          data.expired
        ) {
          router.replace(resultUrl);
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load quiz questions."
          );
        }

        const attempt = data.attempt ?? {};

        const rawQuestions = data.questions ?? [];

        const normalizedQuestions: QuizQuestion[] =
          rawQuestions.map((item: Record<string, unknown>) => {
            const options = (
              item.options ?? {}
            ) as Partial<Record<Option, string>>;

            return {
              id: String(item.id),
              questionCode: String(
                item.questionCode ?? item.question_code ?? ""
              ),
              questionOrder: Number(
                item.questionOrder ?? item.question_order ?? 0
              ),
              questionText: String(
                item.questionText ?? item.question_text ?? ""
              ),
              marks: Number(item.marks ?? 0),
              negativeMarks: Number(
                item.negativeMarks ?? item.negative_marks ?? 0
              ),
              options: {
                A: String(options.A ?? ""),
                B: String(options.B ?? ""),
                C: String(options.C ?? ""),
                D: String(options.D ?? ""),
              },
              selectedOption: (
                item.selectedOption ??
                item.selected_option ??
                null
              ) as Option | null,
            };
          });

        if (normalizedQuestions.length === 0) {
          throw new Error("No questions found in this quiz.");
        }

        if (!active) return;

        setQuestions(normalizedQuestions);

        const savedAnswers: Record<string, Option | null> = {};

        normalizedQuestions.forEach((question) => {
          savedAnswers[question.id] = question.selectedOption;
        });

        setAnswers(savedAnswers);

        const selectedLanguage = String(
          attempt.language ??
          attempt.selectedLanguage ??
          attempt.selected_language ??
          "en"
        );

        setLanguage(selectedLanguage === "hi" ? "hi" : "en");

        const remaining = Number(
          attempt.remainingSeconds ??
          data.remainingSeconds ??
          0
        );

        setRemainingSeconds(remaining);

        // Prefer the server's actual deadline.
        const expiryValue =
          attempt.expiresAt ??
          attempt.expires_at ??
          data.expiresAt;

        const parsedExpiry = expiryValue
          ? new Date(String(expiryValue)).getTime()
          : NaN;

        setExpiryTimestamp(
          Number.isFinite(parsedExpiry)
            ? parsedExpiry
            : Date.now() + remaining * 1000
        );

        setTabSwitchCount(
          Number(
            attempt.tabSwitchCount ??
            attempt.tab_switch_count ??
            0
          )
        );

        setMaxTabSwitches(
          Number(
            attempt.maxTabSwitches ??
            attempt.max_tab_switches ??
            3
          )
        );

        setSaveStatus("All answers saved");
        setLoading(false);
      } catch (error) {
        if (!active) return;

        setError(getMessage(error));
        setLoading(false);
      }
    }

    loadQuestions();

    return () => {
      active = false;
    };
  }, [questionsUrl, resultUrl, router]);

  // -------------------------------------------------------
  // 3. Save answer automatically
  // -------------------------------------------------------

  const saveAnswer = (
    questionId: string,
    selectedOption: Option | null
  ) => {
    setSaveStatus("Saving...");

    const task = saveQueueRef.current
      .catch(() => undefined)
      .then(async () => {
        const response = await fetch(answersUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId,
            selectedOption,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 409 && data.expired) {
            void submitQuiz();
          }

          throw new Error(
            data.message || "Unable to save answer."
          );
        }

        setSaveStatus("All answers saved");
      });

    saveQueueRef.current = task;

    task.catch((error: unknown) => {
      setSaveStatus("Save failed");
      setError(getMessage(error));
    });

    return task;
  };

  const handleAnswer = (
    questionId: string,
    option: Option
  ) => {
    if (isSubmitting) return;

    setError("");

    // Update the UI immediately.
    setAnswers((previous) => ({
      ...previous,
      [questionId]: option,
    }));

    // Persist the answer on the server.
    void saveAnswer(questionId, option).catch(() => undefined);
  };

  const clearAnswer = (questionId: string) => {
    if (isSubmitting) return;

    setAnswers((previous) => ({
      ...previous,
      [questionId]: null,
    }));

    void saveAnswer(questionId, null).catch(() => undefined);
  };

  // -------------------------------------------------------
  // 4. Countdown timer
  // -------------------------------------------------------

  useEffect(() => {
    if (
      loading ||
      isSubmitting ||
      expiryTimestamp === null
    ) {
      return;
    }

    const updateTimer = () => {
      const seconds = Math.max(
        0,
        Math.ceil((expiryTimestamp - Date.now()) / 1000)
      );

      setRemainingSeconds(seconds);

      if (seconds === 0) {
        void submitQuiz();
      }
    };

    updateTimer();

    const timer = window.setInterval(
      updateTimer,
      1000
    );

    return () => window.clearInterval(timer);
  }, [
    loading,
    isSubmitting,
    expiryTimestamp,
    submitQuiz,
  ]);

  // -------------------------------------------------------
  // 5. Detect tab switching
  // -------------------------------------------------------

  useEffect(() => {
    if (loading || isSubmitting) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        wasHiddenRef.current = false;
        return;
      }

      if (wasHiddenRef.current) return;

      wasHiddenRef.current = true;

      try {
        const response = await fetch(tabSwitchUrl, {
          method: "POST",
          cache: "no-store",
          keepalive: true,
        });

        const data = await response.json();

        if (
          !response.ok &&
          response.status !== 409
        ) {
          throw new Error(
            data.message || "Unable to record tab switch."
          );
        }

        if (typeof data.tabSwitchCount === "number") {
          setTabSwitchCount(data.tabSwitchCount);
        }

        if (typeof data.maxTabSwitches === "number") {
          setMaxTabSwitches(data.maxTabSwitches);
        }

        if (data.shouldSubmit) {
          setNotice(
            "Your tab-switch limit has been reached. Your quiz is being submitted."
          );

          // The updated server API submits atomically
          // and returns the result on the third switch.
          if (data.result) {
            router.replace(resultUrl);
          } else {
            await submitQuiz();
          }

          return;
        }

        const count = Number(data.tabSwitchCount ?? 0);

        if (count === 1) {
          setNotice(
            "Warning 1: Please do not leave the quiz screen again."
          );
        } else if (count === 2) {
          setNotice(
            "Final warning: One more tab switch will submit your quiz automatically."
          );
        }
      } catch (error) {
        setError(getMessage(error));
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [
    loading,
    isSubmitting,
    tabSwitchUrl,
    resultUrl,
    router,
    submitQuiz,
  ]);

  // -------------------------------------------------------
  // 6. Manual submission
  // -------------------------------------------------------

  const handleSubmit = () => {
    const confirmed = window.confirm(
      "Are you sure you want to submit this quiz? You cannot change your answers after submission."
    );

    if (confirmed) {
      void submitQuiz();
    }
  };

  // -------------------------------------------------------
  // 7. Derived values
  // -------------------------------------------------------

  const currentQuestion = questions[currentIndex];

  const answeredCount = Object.values(answers).filter(
    (answer) => answer !== null
  ).length;

  const unansweredCount = questions.length - answeredCount;

  const isLastQuestion =
    currentIndex === questions.length - 1;

  // -------------------------------------------------------
  // 8. Loading and error states
  // -------------------------------------------------------

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <FiLoader className="animate-spin text-3xl text-[#003B64]" />
        <p className="text-sm text-gray-600">
          Loading your quiz...
        </p>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-6 text-center">
        <FiAlertTriangle className="mx-auto mb-3 text-3xl text-red-500" />
        <h2 className="font-semibold text-gray-900">
          Unable to load quiz
        </h2>
        <p className="mt-2 text-sm text-red-600">
          {error || "No questions are available."}
        </p>
      </div>
    );
  }

  // -------------------------------------------------------
  // 9. Quiz UI
  // -------------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl space-y-5">

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2 text-[#003B64]">
            <FiBookOpen size={20} />
            <h1 className="text-lg font-bold">
              Quiz in Progress
            </h1>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            Language: {language === "hi" ? "Hindi" : "English"}
          </p>
        </div>

        <div
          className={`flex items-center gap-2 rounded-lg px-4 py-3 font-bold ${
            remainingSeconds <= 60
              ? "bg-red-50 text-red-600"
              : "bg-blue-50 text-[#003B64]"
          }`}
        >
          <FiClock size={19} />

          <span className="text-xl tabular-nums">
            {formatTime(remainingSeconds)}
          </span>
        </div>
      </div>

      {/* Warning */}
      {notice && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <FiAlertTriangle className="mt-0.5 shrink-0" />
          <p>{notice}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Progress */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
          <span className="font-semibold text-gray-700">
            Answered: {answeredCount}/{questions.length}
          </span>

          <span className="text-gray-500">
            Unanswered: {unansweredCount}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#003B64] transition-all"
            style={{
              width: `${
                (answeredCount / questions.length) * 100
              }%`,
            }}
          />
        </div>

        <p className="mt-2 text-xs text-gray-500">
          {saveStatus}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">

        {/* Question panel */}
        <div className="space-y-4 lg:col-span-8">

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">

            <div className="mb-5 flex items-center justify-between gap-3">
              <span className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-semibold text-[#003B64]">
                Question {currentIndex + 1} of {questions.length}
              </span>

              <span className="text-sm text-gray-500">
                {currentQuestion.marks} mark(s)
              </span>
            </div>

            <h2 className="mb-6 text-lg font-semibold leading-relaxed text-gray-900">
              {currentQuestion.questionText}
            </h2>

            <div className="space-y-3">

              {(["A", "B", "C", "D"] as Option[]).map(
                (option) => {
                  const selected =
                    answers[currentQuestion.id] === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={isSubmitting}
                      onClick={() =>
                        handleAnswer(currentQuestion.id, option)
                      }
                      aria-pressed={selected}
                      className={`flex w-full items-center gap-3 rounded-lg border p-4 text-left transition ${
                        selected
                          ? "border-[#003B64] bg-blue-50"
                          : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                          selected
                            ? "border-[#003B64] bg-[#003B64] text-white"
                            : "border-gray-300 text-gray-700"
                        }`}
                      >
                        {option}
                      </span>

                      <span className="flex-1 text-sm font-medium text-gray-800">
                        {currentQuestion.options[option]}
                      </span>

                      {selected && (
                        <FiCheckCircle
                          className="text-[#003B64]"
                          size={19}
                        />
                      )}
                    </button>
                  );
                }
              )}

            </div>

            {/* Clear answer */}
            {answers[currentQuestion.id] && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  clearAnswer(currentQuestion.id)
                }
                className="mt-4 text-sm font-medium text-red-600 hover:underline"
              >
                Clear answer
              </button>
            )}

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-gray-100 pt-5">

              <button
                type="button"
                disabled={currentIndex === 0 || isSubmitting}
                onClick={() =>
                  setCurrentIndex((previous) =>
                    Math.max(0, previous - 1)
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FiChevronLeft />
                Previous
              </button>

              {!isLastQuestion ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() =>
                    setCurrentIndex((previous) =>
                      Math.min(questions.length - 1, previous + 1)
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-[#003B64] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#002B4A] disabled:opacity-50"
                >
                  Next
                  <FiChevronRight />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  Submit Quiz
                  <FiSend />
                </button>
              )}

            </div>
          </div>
        </div>

        {/* Question palette */}
        <aside className="space-y-4 lg:col-span-4">

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <h3 className="mb-4 font-semibold text-gray-900">
              Question Palette
            </h3>

            <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">

              {questions.map((question, index) => {
                const answered = Boolean(answers[question.id]);
                const active = index === currentIndex;

                return (
                  <button
                    key={question.id}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setCurrentIndex(index)}
                    className={`flex h-10 items-center justify-center rounded-lg border text-sm font-semibold transition ${
                      active
                        ? "border-[#003B64] bg-[#003B64] text-white"
                        : answered
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}

            </div>

            <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-xs text-gray-600">

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-[#003B64]" />
                Current question
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-green-500" />
                Answered
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm bg-gray-200" />
                Not answered
              </div>

            </div>
          </div>

          {/* Tab switch information */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

            <div className="flex items-center gap-2 font-semibold text-amber-800">
              <FiAlertTriangle />
              Tab Switch Warning
            </div>

            <p className="mt-2 text-sm text-amber-700">
              Switch limit: {tabSwitchCount}/{maxTabSwitches}
            </p>

            <p className="mt-1 text-xs text-amber-700">
              Reaching the maximum limit will automatically submit your quiz.
            </p>
          </div>

          {/* Submit button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <FiSend />
                Submit Quiz
              </>
            )}
          </button>

          {isSubmitting && (
            <p className="text-center text-xs text-gray-500">
              Please wait. Do not close this page.
            </p>
          )}

        </aside>
      </div>
    </div>
  );
}

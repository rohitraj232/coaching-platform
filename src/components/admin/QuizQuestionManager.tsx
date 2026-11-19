
"use client";

import { useState } from "react";
import QuizExcelUpload from "@/components/admin/QuizExcelUpload";
import QuizQuestionPreview from "@/components/admin/QuizQuestionPreview";

type Props = {
  quizId: string;
};

export default function QuizQuestionManager({ quizId }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleUploadSuccess() {
    setRefreshKey((current) => current + 1);
  }

  return (
    <>
      <QuizExcelUpload
        quizId={quizId}
        onUploadSuccess={handleUploadSuccess}
      />

      <QuizQuestionPreview
        quizId={quizId}
        refreshKey={refreshKey}
      />
    </>
  );
}

import type { Question } from "../types/question";

export const chapterGroups = {
  "All Chapters": [],
  "Relations & Functions": ["Relations & Functions", "Relations and Functions", "Inverse Trigonometric Functions"],
  "Matrices & Determinants": ["Matrices & Determinants", "Matrices", "Determinants"],
  Calculus: ["Calculus", "Continuity and Differentiability", "Applications of Derivatives", "Application of Derivatives", "Integrals", "Applications of Integrals", "Application of Integrals", "Differential Equations"],
  "Vectors & 3D": ["Vectors & 3D", "Vectors", "Vector Algebra", "Three Dimensional Geometry", "Three-Dimensional Geometry", "3D Geometry"],
  Probability: ["Probability"],
  LPP: ["LPP", "Linear Programming"],
} satisfies Record<string, string[]>;

export type ChapterFilter = keyof typeof chapterGroups;
export const chapters = Object.keys(chapterGroups) as ChapterFilter[];

export function filterQuestions(questions: Question[], chapter: ChapterFilter, search: string) {
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const group: readonly string[] = chapterGroups[chapter];
  return questions.filter((question) => {
    const matchesChapter = chapter === "All Chapters" || group.some(
      (name) => name.toLowerCase() === question.chapter.toLowerCase(),
    );
    const searchable = [question.question, question.chapter, question.year,
      `${question.marks} marks`, ...(question.tags ?? [])].join(" ").toLowerCase();
    return matchesChapter && terms.every((term) => searchable.includes(term));
  });
}

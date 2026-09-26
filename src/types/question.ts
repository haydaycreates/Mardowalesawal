export interface Question {
  id: string;
  chapter: string;
  year: string;
  marks: number;
  question: string;
  hint: string;
  solution: string;
  tags?: string[];
}

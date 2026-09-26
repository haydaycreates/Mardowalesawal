import { useId, useState } from "react";
import { ArrowUpRight, ChevronDown, Lightbulb } from "lucide-react";
import type { Question } from "../types/question";
import MathText from "./MathText";

export default function QuestionCard({ question, number }: { question: Question; number: number }) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const id = useId();

  return (
    <article className="question-card" aria-labelledby={`${id}-title`}>
      <div className="card-heading">
        <h3 id={`${id}-title`} className="question-number">QUESTION {String(number).padStart(2, "0")}</h3>
        <span className="marks">{question.marks} Marks</span>
      </div>
      <div className="question-meta">
        <span className="chapter-badge">{question.chapter}</span>
        <span className="year-tag">{question.year}</span>
        {question.tags?.map((tag) => <span className="extra-tag" key={tag}>{tag}</span>)}
      </div>
      <div className="question-body"><MathText text={question.question} /></div>
      <div className="card-actions">
        <button type="button" className="hint-button" aria-expanded={showHint} aria-controls={`${id}-hint`}
          onClick={() => setShowHint(!showHint)}>
          <Lightbulb size={16} aria-hidden="true" />{showHint ? "Hide Hint" : "Show Hint"}
          <ChevronDown size={14} className={showHint ? "rotated" : ""} aria-hidden="true" />
        </button>
        <button type="button" className="solution-button" aria-expanded={showSolution} aria-controls={`${id}-solution`}
          onClick={() => setShowSolution(!showSolution)}>
          {showSolution ? "Hide Full Solution" : "View Full Solution"}
          {showSolution ? <ChevronDown className="rotated" size={16} aria-hidden="true" /> : <ArrowUpRight size={16} aria-hidden="true" />}
        </button>
      </div>
      <section id={`${id}-hint`} className="answer-panel hint-panel" hidden={!showHint} aria-label="Hint">
        <h4>A LITTLE NUDGE</h4>
        {showHint && <MathText text={question.hint} />}
      </section>
      <section id={`${id}-solution`} className="answer-panel" hidden={!showSolution} aria-label="Full solution">
        <h4>FULL SOLUTION</h4>
        {showSolution && <MathText text={question.solution} />}
      </section>
    </article>
  );
}

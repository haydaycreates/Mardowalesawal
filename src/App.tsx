import { useState } from "react";
import { BookOpen, SearchX, Sigma } from "lucide-react";
import QuestionCard from "./components/QuestionCard";
import QuestionFilters from "./components/QuestionFilters";
import questionData from "./data/questions.json";
import type { Question } from "./types/question";
import { filterQuestions, type ChapterFilter } from "./utils/questions";

const questions: Question[] = questionData;

export default function App() {
  const [chapter, setChapter] = useState<ChapterFilter>("All Chapters");
  const [search, setSearch] = useState("");
  const filtered = filterQuestions(questions, chapter, search);
  const isFiltered = chapter !== "All Chapters" || search.length > 0;
  function resetFilters() {
    setChapter("All Chapters");
    setSearch("");
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#question-bank">Skip to questions</a>
      <header className="site-header">
        <div className="brand">
          <div className="brand-mark"><Sigma size={26} strokeWidth={1.8} aria-hidden="true" /></div>
          <div><h1>Mardo Wale Sawaal</h1><p>CBSE Class 12 Maths HOTS &amp; PYQs</p></div>
        </div>
        <span className="practice-label"><span /> PERSONAL PRACTICE</span>
      </header>
      <main id="question-bank">
        <section className="bank-intro" aria-labelledby="bank-title">
          <div>
            <div className="eyebrow"><BookOpen size={15} aria-hidden="true" /> THE QUESTION BANK</div>
            <h2 id="bank-title">Less scrolling. <span>More solving.</span></h2>
            <p>Pick a topic. Take a shot. Unpack the solution when you’re ready.</p>
          </div>
          <div className="bank-count"><strong>{questions.length.toString().padStart(2, "0")}</strong><span>QUESTIONS</span></div>
        </section>
        <QuestionFilters chapter={chapter} search={search} onChapterChange={setChapter} onSearchChange={setSearch} />
        <section className="question-list" aria-label="Questions">
          <div className="results-heading">
            <p role="status">Showing <strong>{filtered.length}</strong> of {questions.length} questions</p>
            {isFiltered ? <button type="button" className="reset-button" onClick={resetFilters}>Reset filters</button>
              : <span className="practice-tip">Try it yourself before revealing the answer.</span>}
          </div>
          {filtered.length ? filtered.map((question) => (
            <QuestionCard key={question.id} question={question} number={questions.indexOf(question) + 1} />
          )) : (
            <div className="empty-state">
              <SearchX size={30} strokeWidth={1.5} aria-hidden="true" />
              <h3>No questions found</h3>
              <p>Try a different search or chapter.</p>
              <button type="button" className="chapter-pill" onClick={resetFilters}>Show all questions</button>
            </div>
          )}
        </section>
      </main>
      <footer className="site-footer"><span>One question at a time.</span><span>UNDERSTAND. PRACTISE. REPEAT.</span></footer>
    </div>
  );
}

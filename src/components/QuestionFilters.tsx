import { Search, X } from "lucide-react";
import { chapters, type ChapterFilter } from "../utils/questions";

interface Props {
  chapter: ChapterFilter;
  search: string;
  onChapterChange: (chapter: ChapterFilter) => void;
  onSearchChange: (search: string) => void;
}

export default function QuestionFilters({ chapter, search, onChapterChange, onSearchChange }: Props) {
  return (
    <section className="filters" aria-label="Filter questions">
      <div className="filter-label">FIND YOUR FOCUS</div>
      <div className="chapter-pills" role="group" aria-label="Chapter">
        {chapters.map((name) => (
          <button key={name} type="button" className="chapter-pill" aria-pressed={chapter === name}
            onClick={() => onChapterChange(name)}>{name}</button>
        ))}
      </div>
      <div className="search-field">
        <Search size={19} aria-hidden="true" />
        <label className="sr-only" htmlFor="question-search">Search questions or tags</label>
        <input id="question-search" type="search" placeholder="Search questions, topics or tags…"
          value={search} onChange={(event) => onSearchChange(event.target.value)} />
        {search && <button className="icon-button" type="button" aria-label="Clear search"
          onClick={() => onSearchChange("")}><X size={17} aria-hidden="true" /></button>}
      </div>
    </section>
  );
}

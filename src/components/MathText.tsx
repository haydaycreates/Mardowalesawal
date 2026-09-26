import { Fragment, useMemo } from "react";
import katex from "katex";

/** Render dollar-delimited inline/display math; ordinary text stays React-escaped. */
export default function MathText({ text }: { text: string }) {
  const parts = useMemo(() => {
    const pattern = /(?<!\\)(\$\$[\s\S]+?(?<!\\)\$\$|\$(?!\$)(?:\\.|[^$\\])+?\$)/g;
    return text.split(pattern).map((part, index) => {
      if (index % 2 === 0) return { text: part.replace(/\\\$/g, "$"), html: null, display: false };
      const display = part.startsWith("$$");
      const delimiterLength = display ? 2 : 1;
      return {
        text: part,
        display,
        html: katex.renderToString(part.slice(delimiterLength, -delimiterLength), {
          displayMode: display,
          throwOnError: false,
          trust: false,
          output: "htmlAndMathml",
        }),
      };
    });
  }, [text]);

  return (
    <div className="math-text">
      {parts.map((part, index) => part.html === null ? (
        <Fragment key={index}>{part.text}</Fragment>
      ) : (
        // Only KaTeX-generated markup is inserted, never raw question text.
        <span key={index} className={part.display ? "math-display" : "math-inline"}
          dangerouslySetInnerHTML={{ __html: part.html }} />
      ))}
    </div>
  );
}

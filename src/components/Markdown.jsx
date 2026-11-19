import { memo, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import scss from "highlight.js/lib/languages/scss";
import json from "highlight.js/lib/languages/json";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import powershell from "highlight.js/lib/languages/powershell";
import sql from "highlight.js/lib/languages/sql";
import markdownLanguage from "highlight.js/lib/languages/markdown";
import yaml from "highlight.js/lib/languages/yaml";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import go from "highlight.js/lib/languages/go";
import rust from "highlight.js/lib/languages/rust";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import diff from "highlight.js/lib/languages/diff";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import plaintext from "highlight.js/lib/languages/plaintext";
import { Check, Copy } from "./Icons";
import { useCopy } from "../lib/useCopy";

/**
 * highlight.js ships ~190 grammars. Registering a curated set keeps the
 * bundle small while covering what chat answers actually use.
 */
const LANGUAGES = {
  javascript,
  typescript,
  xml,
  css,
  scss,
  json,
  python,
  bash,
  powershell,
  sql,
  markdown: markdownLanguage,
  yaml,
  java,
  c,
  cpp,
  csharp,
  go,
  rust,
  php,
  ruby,
  swift,
  kotlin,
  diff,
  dockerfile,
  plaintext,
};

for (const [name, definition] of Object.entries(LANGUAGES)) {
  hljs.registerLanguage(name, definition);
}

const LANGUAGE_LABELS = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  xml: "HTML",
  css: "CSS",
  scss: "SCSS",
  json: "JSON",
  python: "Python",
  bash: "Shell",
  powershell: "PowerShell",
  sql: "SQL",
  markdown: "Markdown",
  yaml: "YAML",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
  diff: "Diff",
  dockerfile: "Dockerfile",
  plaintext: "Text",
};

const ALIASES = {
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  ts: "typescript",
  tsx: "typescript",
  html: "xml",
  svg: "xml",
  sh: "bash",
  zsh: "bash",
  shell: "bash",
  py: "python",
  rb: "ruby",
  yml: "yaml",
  md: "markdown",
  ps1: "powershell",
  cs: "csharp",
  docker: "dockerfile",
  text: "plaintext",
  txt: "plaintext",
  h: "c",
  hpp: "cpp",
};

function extractText(children) {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children && typeof children === "object" && children.props) {
    return extractText(children.props.children);
  }
  return "";
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function CodeBlock({ children, node: _node, ...props }) {
  const preRef = useRef(null);
  const [copied, copy] = useCopy();

  const firstChild = Array.isArray(children) ? children[0] : children;
  const className =
    firstChild && typeof firstChild === "object" && firstChild.props
      ? String(firstChild.props.className || "")
      : "";
  const match = /language-([\w+#-]+)/.exec(className);
  const requested = match ? match[1].toLowerCase() : "";
  const language = ALIASES[requested] || requested;
  const text = extractText(children);

  const highlighted = useMemo(() => {
    const label = LANGUAGE_LABELS[language] || (requested ? requested.toUpperCase() : "Code");

    if (language && hljs.getLanguage(language)) {
      try {
        return {
          label,
          html: hljs.highlight(text, { language, ignoreIllegals: true }).value,
        };
      } catch {
        /* fall through to escaped text */
      }
    }

    return { label, html: escapeHtml(text) };
  }, [language, requested, text]);

  const handleCopy = () => {
    const value = preRef.current ? preRef.current.innerText : text;
    if (value) copy(value);
  };

  return (
    <div className="codeblock">
      <div className="codeblock__head">
        <span>{highlighted.label}</span>
        <button
          type="button"
          className="codeblock__copy"
          onClick={handleCopy}
          aria-label={copied ? "Copied code" : "Copy code"}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre ref={preRef} {...props}>
        <code
          className={language ? `hljs language-${language}` : "hljs"}
          dangerouslySetInnerHTML={{ __html: highlighted.html }}
        />
      </pre>
    </div>
  );
}

function Link({ node: _node, ...props }) {
  return <a {...props} target="_blank" rel="noreferrer noopener" />;
}

/** Wide tables scroll inside their own box instead of squeezing columns. */
function Table({ node: _node, ...props }) {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Table, scrollable">
      <table {...props} />
    </div>
  );
}

const COMPONENTS = {
  pre: CodeBlock,
  a: Link,
  table: Table,
};

function Markdown({ content }) {
  return (
    <div className="markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default memo(Markdown);

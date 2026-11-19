import { Alert, ArrowUpRight, Bulb, Code, Compass, Sparkles } from "../Icons";
import { greeting, modelLabel } from "../../lib/format";

const SUGGESTIONS = [
  {
    icon: Compass,
    accent: "blue",
    title: "Plan something",
    hint: "A three-day road trip with good food stops",
    prompt:
      "Plan a three-day road trip with scenic stops and a good local food recommendation for each day. Ask me where I'm starting from before you plan.",
  },
  {
    icon: Bulb,
    accent: "amber",
    title: "Explain a concept",
    hint: "How language models learn from text",
    prompt:
      "Explain how large language models learn from text, using a simple analogy that a curious 12-year-old would follow.",
  },
  {
    icon: Code,
    accent: "violet",
    title: "Debug with me",
    hint: "Track down a React re-render problem",
    prompt:
      "My React component re-renders far more often than I expect. Walk me through a practical way to find the cause and fix it.",
  },
  {
    icon: Sparkles,
    accent: "pink",
    title: "Brainstorm ideas",
    hint: "Side projects worth shipping this month",
    prompt:
      "Brainstorm five side projects I could ship in a weekend with React and Node, ranked by how useful each would be in a portfolio.",
  },
];

function statusFor(health) {
  if (health === undefined) return { label: "Connecting…", offline: false };
  if (health === null) return { label: "Server offline", offline: true };
  if (health.configured === false) return { label: "API key needed", offline: true };
  return { label: modelLabel(health.activeModel || health.models?.[0]), offline: false };
}

export default function EmptyState({ onPick, health, onRefreshHealth }) {
  const status = statusFor(health);
  const needsKey = health && health.configured === false;
  const serverDown = health === null;

  return (
    <div className="empty">
      <span className="eyebrow">
        <span className="eyebrow__dot" data-offline={status.offline || undefined} />
        {status.label}
      </span>

      <h1>
        {greeting()}.
        <br />
        <span className="gradient-text">What’s on your mind?</span>
      </h1>

      <p className="empty__lead">
        Ask a question, paste an error, or start with one of these. Conversations stay in this
        browser, so you can pick them back up later.
      </p>

      {serverDown || needsKey ? (
        <div className="setup-notice" role="status">
          <Alert size={17} />
          <div>
            {serverDown ? (
              <>
                <strong>The API server isn’t running.</strong> Start it with{" "}
                <code>npm run server</code> in a second terminal, then check again.
              </>
            ) : (
              <>
                <strong>No Gemini API key found.</strong> Add{" "}
                <code>GEMINI_API_KEY=your_key</code> to a <code>.env</code> file at the project root
                and restart the server.
              </>
            )}
          </div>
          <button type="button" className="setup-notice__action" onClick={onRefreshHealth}>
            Check again
          </button>
        </div>
      ) : null}

      <div className="suggestions">
        {SUGGESTIONS.map(({ icon: Icon, accent, title, hint, prompt }) => (
          <button
            key={title}
            type="button"
            className="suggestion"
            data-accent={accent}
            onClick={() => onPick(prompt)}
            aria-label={`${title}: ${hint}`}
          >
            <div className="suggestion__top">
              <span className="suggestion__icon">
                <Icon size={17} />
              </span>
              <ArrowUpRight className="suggestion__arrow" size={16} />
            </div>
            <div>
              <div className="suggestion__title">{title}</div>
              <div className="suggestion__hint">{hint}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

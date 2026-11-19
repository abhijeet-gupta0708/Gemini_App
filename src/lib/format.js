const DAY = 24 * 60 * 60 * 1000;

function startOfLocalDay(date) {
  const copy = new Date(date);
  return new Date(copy.getFullYear(), copy.getMonth(), copy.getDate()).getTime();
}

/**
 * Groups conversations into Today / Yesterday / Previous 7 days / Older.
 * Uses local calendar days so "today" matches what the user sees.
 */
export function groupChats(chats) {
  const now = new Date();
  const today = startOfLocalDay(now);
  const yesterday = startOfLocalDay(new Date(today - 1));
  const weekAgo = startOfLocalDay(new Date(today - 7));

  const buckets = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];

  for (const chat of [...chats].sort(
    (a, b) =>
      (Number(b.updatedAt) || Number(b.createdAt) || 0) -
      (Number(a.updatedAt) || Number(a.createdAt) || 0)
  )) {
    const time = Number(chat.updatedAt) || Number(chat.createdAt) || 0;
    if (time >= today) buckets[0].items.push(chat);
    else if (time >= yesterday) buckets[1].items.push(chat);
    else if (time >= weekAgo) buckets[2].items.push(chat);
    else buckets[3].items.push(chat);
  }

  return buckets.filter((bucket) => bucket.items.length > 0);
}

export function formatTimestamp(timestamp) {
  const value = Number(timestamp);
  if (!Number.isFinite(value) || value <= 0) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export function isSameDay(a, b) {
  if (!a || !b) return false;
  return Math.abs(a - b) < DAY;
}

/**
 * Turns stored messages into the plain history payload the API expects.
 */
export function toHistory(messages) {
  return messages
    .filter((message) => message && message.content && message.content.trim())
    .map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      content: message.content,
    }));
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "Working late";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * Human label for a Gemini model id: `gemini-3.5-flash` → `Gemini 3.5 Flash`.
 */
export function modelLabel(model) {
  if (!model) return "Gemini";
  return String(model)
    .split("-")
    .filter(Boolean)
    .map((part) => {
      if (/^\d/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(" ");
}

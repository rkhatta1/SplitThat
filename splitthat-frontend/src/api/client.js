const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Calls the FastAPI backend:
 * POST /api/v1/split-bill/ (multipart/form-data)
 */
export async function splitBill({
  file,
  participants,
  userPrompt,
  signal
}) {
  const fd = new FormData();
  fd.append("file", file);
  for (const p of participants) {
    fd.append("participants", p);
  }
  if (userPrompt && userPrompt.trim().length) {
    fd.append("user_prompt", userPrompt.trim());
  }

  const res = await fetch(`${BASE_URL}/api/v1/split-bill/`, {
    method: "POST",
    body: fd,
    signal
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Backend error ${res.status}: ${text || res.statusText}`
    );
  }

  return res.json();
}
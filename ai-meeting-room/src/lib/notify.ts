export async function sendNotification(
  title: string,
  body: string,
  priority: string = "default"
) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) return;
  try {
    await fetch(`https://ntfy.sh/${topic}`, {
      method: "POST",
      headers: {
        Title: title,
        Priority: priority,
        "Content-Type": "text/plain; charset=utf-8",
      },
      body,
    });
  } catch (e) {
    console.error("ntfy error:", e);
  }
}

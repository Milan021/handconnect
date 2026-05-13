export async function POST(req) {
  try {
    const { messages, system } = await req.json();

    // Filtrer les messages vides
    const cleanMessages = (messages || []).filter(
      (m) => m.content && m.content.trim() !== ""
    );

    if (cleanMessages.length === 0) {
      return Response.json({ error: "Aucun message à envoyer" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: system || "",
        messages: cleanMessages.map((m) => ({
          role: m.role,
          content: m.content.trim(),
        })),
      }),
    });

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
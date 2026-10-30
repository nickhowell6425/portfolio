export interface ContactMessage {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

/** An HTTP response alone does not confirm that the provider accepted the message. */
export async function sendContact(message: ContactMessage): Promise<boolean> {
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!response.ok) return false;
    return (await response.json()).ok === true;
  } catch {
    return false;
  }
}

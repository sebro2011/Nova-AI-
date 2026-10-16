/**
 * Server-side request validation for the chat API.
 * All limits are enforced here so the client cannot bypass them.
 */
import { z } from "zod";

/** Maximum characters allowed in a single message. */
export const MAX_MESSAGE_CHARS = 8_000;
/** Maximum number of messages sent in one request (conversation length cap). */
export const MAX_MESSAGES = 40;
/** Maximum total characters across all messages in one request. */
export const MAX_TOTAL_CHARS = 32_000;
/** Maximum accepted request body size in bytes. */
export const MAX_REQUEST_BYTES = 128 * 1024;

export const messageRoleSchema = z.enum(["user", "assistant"]);

export const chatMessageSchema = z
  .object({
    role: messageRoleSchema,
    content: z
      .string()
      .min(1, "Message content must not be empty")
      .max(
        MAX_MESSAGE_CHARS,
        `Message content must not exceed ${MAX_MESSAGE_CHARS} characters`
      ),
  })
  .strict();

export const chatRequestSchema = z
  .object({
    conversationId: z.string().min(1).max(64).optional(),
    messages: z
      .array(chatMessageSchema)
      .min(1, "At least one message is required")
      .max(MAX_MESSAGES, `At most ${MAX_MESSAGES} messages are allowed`),
    /** Optional model id — must match a model configured on the server. */
    model: z.string().min(1).max(200).optional(),
    locale: z.enum(["en", "si", "ta"]).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    let total = 0;
    for (const message of value.messages) {
      total += message.content.length;
    }
    if (total > MAX_TOTAL_CHARS) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Total conversation length must not exceed ${MAX_TOTAL_CHARS} characters`,
        path: ["messages"],
      });
    }
    const last = value.messages[value.messages.length - 1];
    if (last && last.role !== "user") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The last message must come from the user",
        path: ["messages"],
      });
    }
    for (let i = 0; i < value.messages.length - 1; i++) {
      const prev = value.messages[i];
      const next = value.messages[i + 1];
      if (prev && next && prev.role === next.role) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Message roles must alternate between user and assistant",
          path: ["messages", i + 1],
        });
        break;
      }
    }
  });

export type ChatRequest = z.infer<typeof chatRequestSchema>;

/** Flatten zod issues into a single human-readable string (safe for clients). */
export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => issue.message)
    .filter(Boolean)
    .join("; ");
}

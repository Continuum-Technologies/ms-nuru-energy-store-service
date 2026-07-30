import { z } from "zod";

// Shared by the login Server Function (real enforcement) and the client-side
// form (instant field feedback) — one source of truth, per CLAUDE.md §9:
// client-side validation improves usability but the server check is what
// actually matters.
export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

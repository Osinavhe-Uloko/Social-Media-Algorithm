import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is required").max(120),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  matricNumber: z.string().max(40).optional().or(z.literal("")),
  faculty: z.string().optional().or(z.literal("")),
  level: z.string().optional().or(z.literal("")),
  gender: z.string().optional().or(z.literal("")),
  ageBand: z.string().optional().or(z.literal("")),
  primaryPlatform: z.string().optional().or(z.literal("")),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const submitAssessmentSchema = z.object({
  answers: z.record(z.string(), z.number().min(1).max(5)),
  cgpaBand: z.string().nullable().optional(),
});

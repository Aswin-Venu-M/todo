import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const RegisterSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().trim().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const TodoStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const TodoPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const CreateTodoSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(120, "Title is too long"),
  description: z.string().trim().max(1000, "Description is too long").optional().nullable(),
  status: TodoStatusEnum.default("TODO"),
  priority: TodoPriorityEnum.default("MEDIUM"),
  ownerId: z.string().uuid().optional(),
});

export const UpdateTodoSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").max(120).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  status: TodoStatusEnum.optional(),
  priority: TodoPriorityEnum.optional(),
});

export const GrantAccessSchema = z.object({
  email: z.string().trim().email("Enter a valid user email address").toLowerCase(),
  canView: z.boolean().default(true),
  canEdit: z.boolean().optional(),
});

export const UpdateAccessSchema = z.object({
  canEdit: z.boolean(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;
export type GrantAccessInput = z.infer<typeof GrantAccessSchema>;

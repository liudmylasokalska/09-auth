import { User } from "@/types/user";
import { Note } from "@/types/note";
import { RegisterRequest, LoginRequest, SessionResponse } from "@/types/auth";
import { cookies } from "next/headers";
import { nextServer } from "./api";
import { isAxiosError, AxiosRequestConfig } from "axios";

const DEFAULT_TAGS = ["Todo", "Personal", "Work", "Shopping", "Meeting"];

// Генерація cookie-хедерів

async function getAuthHeaders() {
  const cookieStore = await cookies();
  const cookieString = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return { Cookie: cookieString };
}

// Універсальний обробник запитів

async function request<T>(
  method: "get" | "post" | "patch" | "delete",
  url: string,
  options: AxiosRequestConfig = {},
  defaultError = "Request failed"
): Promise<T> {
  try {
    const headers = await getAuthHeaders();
    const { data } = await nextServer.request<T>({
      method,
      url,
      headers,
      ...options,
    });
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || defaultError);
    }
    throw new Error(defaultError);
  }
}

// ==== AUTH ====

export const registerServer = (data: RegisterRequest) =>
  request<User>("post", "/auth/register", { data }, "Registration failed");

export const loginServer = (data: LoginRequest) =>
  request<User>("post", "/auth/login", { data }, "Login failed");

export const logoutServer = () =>
  request<void>("post", "/auth/logout", {}, "Logout failed");

export const checkSession = () =>
  request<SessionResponse>("get", "/auth/session", {}, "Session check failed");

// ==== USERS ====
export const getUserProfile = () =>
  request<User>("get", "/users/me", {}, "Unauthorized");

export const updateUser = (update: Partial<Pick<User, "username">>) =>
  request<User>("patch", "/users/me", { data: update }, "Update failed");

// ==== NOTES ====

export const fetchNotes = (
  search = "",
  page = 1,
  perPage = 12,
  tag?: string
): Promise<{ notes: Note[]; totalPages: number }> => {
  const params: Record<string, string> = {
    page: String(page),
    perPage: String(perPage),
  };
  if (search) params.search = search;
  if (tag && tag.toLowerCase() !== "all") params.tag = tag;

  return request("get", "/notes", { params }, "Fetching notes failed");
};

export const fetchNoteById = (id: string) =>
  request<Note>("get", `/notes/${id}`, {}, "Fetching note failed");

export const deleteNote = (id: string) =>
  request<Note>("delete", `/notes/${id}`, {}, "Deleting note failed");

// ==== TAGS ====

export const getTags = async (): Promise<string[]> => {
  const { notes } = await fetchNotes();
  const tagsFromNotes = notes.map((note) => note.tag);
  return Array.from(new Set([...DEFAULT_TAGS, ...tagsFromNotes]));
};
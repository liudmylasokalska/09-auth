"use client";

import { Note } from "@/types/note";
import { User } from "@/types/user";
import { RegisterRequest, LoginRequest } from "@/types/auth";
import { nextServer } from "./api";
import { isAxiosError } from "axios";

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

const DEFAULT_TAGS = ["Todo", "Personal", "Work", "Shopping", "Meeting"];

async function handleRequest<T>(
  promise: Promise<{ data: T }>,
  defaultError: string
): Promise<T> {
  try {
    const { data } = await promise;
    return data;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
          const apiMessage =
        err.response?.data &&
        typeof (err.response.data as { message?: unknown }).message === "string"
          ? (err.response.data as { message: string }).message
          : null;

      throw new Error(apiMessage ?? defaultError);
    }
    throw new Error(defaultError);
  }
}

export const registerClient = (data: RegisterRequest): Promise<User> =>
  handleRequest(
    nextServer.post<User>("/auth/register", data),
    "Registration failed"
  );

export const loginClient = (data: LoginRequest): Promise<User> =>
  handleRequest(nextServer.post<User>("/auth/login", data), "Login failed");

export const logoutClient = (): Promise<void> =>
  handleRequest(nextServer.post("/auth/logout"), "Logout failed");

export const checkSession = (): Promise<void> =>
  handleRequest(nextServer.get("/auth/session"), "Session check failed");

export const getUserProfile = (): Promise<User> =>
  handleRequest(nextServer.get<User>("/users/me"), "Unauthorized");

export const updateUser = (
  update: Partial<{ username: string }>
): Promise<User> =>
  handleRequest(nextServer.patch<User>("/users/me", update), "Update failed");

export const fetchNotesClient = (
  search = "",
  page = 1,
  perPage = 12,
  tag?: string
): Promise<FetchNotesResponse> => {
  const params: Record<string, string> = {
    page: String(page),
    perPage: String(perPage),
  };
  if (search) params.search = search;
  if (tag && tag.toLowerCase() !== "all") params.tag = tag;

  return handleRequest(
    nextServer.get<FetchNotesResponse>("/notes", { params }),
    "Fetching notes failed"
  );
};

export const fetchNoteById = (id: string): Promise<Note> =>
  handleRequest(nextServer.get<Note>(`/notes/${id}`), "Fetching note failed");

export const createNote = (note: {
  title: string;
  content: string;
  tag: string;
}): Promise<Note> =>
  handleRequest(nextServer.post<Note>("/notes", note), "Creating note failed");

export const deleteNoteClient = (id: string): Promise<Note> =>
  handleRequest(
    nextServer.delete<Note>(`/notes/${id}`),
    "Deleting note failed"
  );
  
export const getTagsClient = async (): Promise<string[]> => {
  try {
    const res = await fetchNotesClient();
    const tagsFromNotes = res.notes.map((note) => note.tag);
    return Array.from(new Set([...DEFAULT_TAGS, ...tagsFromNotes]));
  } catch (error) {
    console.error("Cannot fetch tags:", error);
    return DEFAULT_TAGS;
  }
};
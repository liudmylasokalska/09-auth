import { User } from "@/types/user";
import { Note } from "@/types/note";
import { RegisterRequest, LoginRequest, SessionResponse } from "@/types/auth";
import { cookies } from "next/headers";
import { nextServer } from "./api";
import { isAxiosError } from "axios";

const DEFAULT_TAGS = ["Todo", "Personal", "Work", "Shopping", "Meeting"];

export async function getAuthHeaders(): Promise<{
  headers: { Cookie: string };
}> {
  const cookieStore = await cookies();
  const cookieString = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
  return { headers: { Cookie: cookieString } };
}

async function handleRequest<T>(
  promise: Promise<{ data: T }>,
  defaultError: string
): Promise<T> {
  try {
    const { data } = await promise;
    return data;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || defaultError);
    }
    throw new Error(defaultError);
  }
}

export const registerServer = async (data: RegisterRequest) =>
  handleRequest(
    nextServer.post<User>("/auth/register", data, await getAuthHeaders()),
    "Registration failed"
  );

export const loginServer = async (data: LoginRequest) =>
  handleRequest(
    nextServer.post<User>("/auth/login", data, await getAuthHeaders()),
    "Login failed"
  );

export const logoutServer = async () =>
  handleRequest(
    nextServer.post("/auth/logout", {}, await getAuthHeaders()),
    "Logout failed"
  );

export const checkSession = async () => {
  try {
    const response = await nextServer.get<SessionResponse>(
      "/auth/session",
      await getAuthHeaders()
    );
    return response;
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Session check failed");
    }
    throw new Error("Session check failed");
  }
};

export const getUserProfile = async () =>
  handleRequest(
    nextServer.get<User>("/users/me", await getAuthHeaders()),
    "Unauthorized"
  );

export const updateUser = async (update: Partial<{ username: string }>) =>
  handleRequest(
    nextServer.patch<User>("/users/me", update, await getAuthHeaders()),
    "Update failed"
  );


export const fetchNotes = async (
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

  return handleRequest(
    nextServer.get("/notes", { ...(await getAuthHeaders()), params }),
    "Fetching notes failed"
  );
};

export const fetchNoteById = async (id: string) =>
  handleRequest(
    nextServer.get<Note>(`/notes/${id}`, await getAuthHeaders()),
    "Fetching note failed"
  );

export const deleteNote = async (id: string) =>
  handleRequest(
    nextServer.delete<Note>(`/notes/${id}`, await getAuthHeaders()),
    "Deleting note failed"
  );

export const getTags = async (): Promise<string[]> => {
  try {
    const res = await fetchNotes();
    const tagsFromNotes = res.notes.map((note) => note.tag);
    return Array.from(new Set([...DEFAULT_TAGS, ...tagsFromNotes]));
  } catch (error) {
    if (isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "Fetching tags failed");
    }
    throw new Error("Fetching tags failed");
  }
};
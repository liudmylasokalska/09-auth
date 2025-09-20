import css from "./createNote.module.css";
import { getTags } from "@/lib/api";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Metadata } from "next";
import CreateNoteClient from "./createNote.client";

export const metadata: Metadata = {
  title: "Create note",
  description: "Use this page to create a new note quickly and easily.",
  openGraph: {
    title: "Create note",
    description: "Use this page to create a new note quickly and easily.",
    url: "https://08-zustand-ten-ochre.vercel.app/notes/action/create",
    images: [
      {
        url: "https://ac.goit.global/fullstack/react/notehub-og-meta.jpg",
        width: 1200,
        height: 630,
        alt: "Note Hub Logo",
      },
    ],
  },
};

export default async function CreateNote() {
  const queryClient = new QueryClient();

  const dehydratedState = dehydrate(queryClient);

  return (
    <main className={css.main}>
      <div className={css.container}>
        <h1 className={css.title}>Create note</h1>
        <HydrationBoundary state={dehydratedState}>
          <CreateNoteClient />
        </HydrationBoundary>
      </div>
    </main>
  );
}
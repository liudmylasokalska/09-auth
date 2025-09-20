import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import NotesClient from "./Notes.client";
import { fetchNotes } from "@/lib/api";
import type { Metadata } from "next";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug ?? [];
  const tag = slug[0] === "all" ? undefined : slug[0];
  return {
    title: `${tag} notes`,
    description: `All ${tag} notes`,
    openGraph: {
      title: `${tag} notes`,
      description: `All ${tag} notes`,
      url: `https://08-zustand-ten-ochre.vercel.app/notes/filter/${tag}`,
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
}

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default async function NotesPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug ?? [];

  const tag = slug[0] && slug[0] !== "all" ? slug[0] : undefined;

  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["notes", "", 1, tag],
    queryFn: () => fetchNotes("", 1, 9, tag),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={tag} />
    </HydrationBoundary>
  );
}
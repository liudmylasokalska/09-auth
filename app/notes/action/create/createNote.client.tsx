"use client";

import NoteForm from "@/components/NoteForm/NoteForm";
import { getTags } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export default function CreateNoteClient() {
  const {
    data: tags = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  if (isLoading) return <p>Loading tags...</p>;
  if (isError) return <p>Error loading tags.</p>;

  return <NoteForm tags={tags} />;
}
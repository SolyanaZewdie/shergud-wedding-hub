import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-blocks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { fetchConversations, fetchMessages, sendMessage } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

type Search = { conversation?: string | undefined };

export const Route = createFileRoute("/_authenticated/messages")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    conversation:
      typeof search["conversation"] === "string" ? (search["conversation"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Messages — Shergud" },
      {
        name: "description",
        content:
          "Chat with wedding vendors and couples. All conversations are saved to your account.",
      },
      { property: "og:title", content: "Messages — Shergud" },
      { property: "og:description", content: "Your saved conversations with vendors and couples." },
    ],
  }),
  component: Messages,
});

function Messages() {
  const { user } = useAuth();
  const { conversation } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const conversations = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => fetchConversations(user!.id),
    enabled: Boolean(user),
    refetchInterval: 8000,
  });

  const activeId = conversation ?? conversations.data?.[0]?.id;

  const messages = useQuery({
    queryKey: ["messages", activeId],
    queryFn: () => fetchMessages(activeId!),
    enabled: Boolean(activeId),
    refetchInterval: 5000,
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.data?.length]);

  const send = useMutation({
    mutationFn: () => sendMessage(activeId!, user!.id, draft.trim()),
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["messages", activeId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: () => toast.error("Message not sent"),
  });

  if (conversations.isLoading) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <LoadingState />
      </div>
    );
  }

  if (conversations.isError) {
    return (
      <div className="min-h-screen">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <ErrorState onRetry={() => conversations.refetch()} />
        </div>
      </div>
    );
  }

  const list = conversations.data ?? [];
  const active = list.find((c) => c.id === activeId);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl sm:text-4xl">Messages</h1>

        {list.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No conversations yet"
              description="Message a vendor from their profile and the chat will appear here."
              action={
                <Button asChild>
                  <Link to="/vendors">Browse vendors</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-[280px_1fr]">
            <aside className="space-y-2">
              {list.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate({ search: { conversation: c.id } })}
                  className={cn(
                    "w-full rounded-lg border p-3 text-left transition-colors",
                    c.id === activeId
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:border-primary/40",
                  )}
                >
                  <p className="font-medium">{c.counterpart}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {c.last_message ?? "No messages yet"}
                  </p>
                </button>
              ))}
            </aside>

            <section className="flex min-h-[420px] flex-col rounded-xl border border-border bg-card">
              <header className="border-b border-border px-4 py-3">
                <p className="font-display text-lg">{active?.counterpart ?? "Conversation"}</p>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.isLoading ? (
                  <LoadingState label="Loading messages..." />
                ) : messages.data && messages.data.length ? (
                  messages.data.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        m.sender_id === user?.id
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      <p className="whitespace-pre-wrap">{m.message}</p>
                      <p className="mt-1 text-[10px] opacity-70">
                        {new Date(m.created_at).toLocaleString("en-GB", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No messages yet — say hello.</p>
                )}
                <div ref={endRef} />
              </div>

              <footer className="border-t border-border p-3">
                <Textarea
                  rows={2}
                  placeholder="Write a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <Button
                  className="mt-2 w-full sm:w-auto"
                  disabled={!draft.trim() || send.isPending || !activeId}
                  onClick={() => send.mutate()}
                >
                  {send.isPending ? "Sending..." : "Send"}
                </Button>
              </footer>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

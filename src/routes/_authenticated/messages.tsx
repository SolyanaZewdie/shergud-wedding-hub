import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";
import { EmptyState, ErrorState, LoadingState } from "@/components/state-blocks";
import { Eyebrow } from "@/components/editorial";

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
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <Eyebrow>Correspondence</Eyebrow>
        <h1 className="type-headline mt-4">Messages</h1>

        {list.length === 0 ? (
          <div className="mt-10">
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
          <div className="mt-10 grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-12">
            <aside
              className={cn(
                "border-t border-border",
                activeId ? "hidden lg:block" : "block",
              )}
            >
              {list.map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate({ search: { conversation: c.id } })}
                  className={cn(
                    "group flex w-full items-start gap-4 border-b border-border py-5 text-left transition-colors",
                    c.id === activeId ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "mt-2 h-px flex-none transition-all",
                      c.id === activeId
                        ? "w-8 bg-primary"
                        : "w-4 bg-border group-hover:w-8 group-hover:bg-primary/60",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="font-display block text-lg text-foreground">
                      {c.counterpart}
                    </span>
                    <span className="mt-1 line-clamp-1 block text-sm text-muted-foreground">
                      {c.last_message ?? "No messages yet"}
                    </span>
                  </span>
                </button>
              ))}
            </aside>

            <section className="flex min-h-[520px] flex-col rounded-lg border border-border bg-card shadow-soft">
              <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                  <Eyebrow>In conversation with</Eyebrow>
                  <p className="font-display mt-1 text-xl">
                    {active?.counterpart ?? "Conversation"}
                  </p>
                </div>
                {activeId ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="type-label lg:hidden"
                    onClick={() => navigate({ search: {} })}
                  >
                    All chats
                  </Button>
                ) : null}
              </header>

              <div className="grain flex-1 space-y-4 overflow-y-auto px-5 py-6">
                {messages.isLoading ? (
                  <LoadingState label="Loading messages..." />
                ) : messages.data && messages.data.length ? (
                  messages.data.map((m) => (
                    <div
                      key={m.id}
                      className={cn(
                        "max-w-[85%] rounded-lg px-4 py-3 sm:max-w-[70%]",
                        m.sender_id === user?.id
                          ? "ml-auto bg-primary text-primary-foreground"
                          : "border border-border bg-background",
                      )}
                    >
                      <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed">
                        {m.message}
                      </p>
                      <p className="type-label mt-2 opacity-70">
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
                  <p className="font-serif text-lg text-muted-foreground">
                    No messages yet — say hello.
                  </p>
                )}
                <div ref={endRef} />
              </div>

              <footer className="border-t border-border p-4">
                <Textarea
                  rows={2}
                  placeholder="Write a message..."
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="resize-none border-0 bg-transparent px-0 font-serif text-lg shadow-none focus-visible:ring-0"
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    className="type-label"
                    disabled={!draft.trim() || send.isPending || !activeId}
                    onClick={() => send.mutate()}
                  >
                    {send.isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </footer>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}


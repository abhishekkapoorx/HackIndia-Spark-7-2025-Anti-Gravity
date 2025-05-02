"use client";

import React, { useState, useEffect, useRef, use } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface IMessage {
  _id: string;
  role: "user" | "agent";
  content: string;
  createdAt: string;
  isLoading?: boolean;
}

export default function ThreadPage(props: {
  params: Promise<{ id: string; threadId: string }>;
}) {
  // unwrap the dynamic params
  const { id, threadId } = use(props.params);
  const spaceId = id; // Map id to spaceId for API calls

  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // ref to auto-scroll
  const bottomRef = useRef<HTMLDivElement>(null);

  // 1) load existing messages
  useEffect(() => {
    setLoading(true);
    // fetch(`/api/spaces/${spaceId}/threads/${threadId}/messages`)
    fetch(`/api/spaces/${spaceId}/threads/${threadId}/messages`)
      .then((r) => r.json())
      .then((data: IMessage[]) => setMessages(data))
      .catch((err) => console.error("Failed to load messages", err))
      .finally(() => setLoading(false));
  }, [spaceId, threadId]);

  // 2) scroll to bottom on update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3) send a new message (and fetch agent reply)
  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    
    const messageText = newMessage.trim();
    setNewMessage(""); // Clear input immediately
    
    // Add user message immediately with temporary ID
    const tempUserMsgId = uuidv4();
    const tempAgentMsgId = uuidv4();
    
    // Create temporary messages
    const tempUserMessage: IMessage = {
      _id: tempUserMsgId,
      role: "user",
      content: messageText,
      createdAt: new Date().toISOString(),
    };
    
    const tempAgentMessage: IMessage = {
      _id: tempAgentMsgId,
      role: "agent",
      content: "",
      createdAt: new Date().toISOString(),
      isLoading: true,
    };
    
    // Update messages state with temporary messages
    setMessages(prev => [...prev, tempUserMessage, tempAgentMessage]);

    try {
      // const res = await fetch(
      //   // `/api/spaces/${spaceId}/threads/${threadId}/messages`,
      //   `http://127.0.0.1:8000/chat`,
      //   {
      //     method: "POST",
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify({ content: newMessage }),
      //   }
      // );
      const res = await fetch(
        `/api/spaces/${spaceId}/threads/${threadId}/messages`,
        // `http://127.0.0.1:8000/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: messageText }),
        }
      );

      if (!res.ok) throw new Error("POST failed");

      const { userMessage, agentResponse, insightsUpdated } = await res.json();
      
      // Show toast notification when insights are updated
      if (insightsUpdated) {
        toast.success("Insights updated successfully!", {
          description: "New insights have been added to your document.",
          duration: 4000,
        });
      }
      
      // Replace temporary messages with real ones from server
      setMessages(prev => 
        prev.map(msg => {
          if (msg._id === tempUserMsgId) {
            return userMessage as IMessage;
          } else if (msg._id === tempAgentMsgId) {
            return agentResponse as IMessage;
          }
          return msg;
        })
      );
    } catch (err) {
      console.error("Send error", err);
      
      // Update the temp agent message to show error
      setMessages(prev => 
        prev.map(msg => {
          if (msg._id === tempAgentMsgId) {
            return {
              ...msg, 
              content: "I'm sorry, I encountered an error while processing your request.",
              isLoading: false
            };
          }
          return msg;
        })
      );
      
      toast.error("Failed to send message", {
        description: "Please try again later.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <Card className="flex flex-col h-full border-0 rounded-none">
        <CardHeader className="border-b px-4 py-2">
          <CardTitle className="text-lg">Thread #{threadId}</CardTitle>
          <CardDescription>Conversation</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-auto p-4 space-y-4">
          {loading ? (
            <p>Loading…</p>
          ) : (
            messages.length > 0 && messages.map((msg) => (
              <div
                key={msg._id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar
                    className={`h-8 w-8 ${
                      msg.role === "user" ? "ml-2" : "mr-2"
                    }`}
                  >
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                    <AvatarFallback>
                      {msg.role === "user" ? "JD" : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div
                      className={`rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.isLoading ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : msg.role === "agent" ? (
                        <div className="markdown-content">
                          <ReactMarkdown
                            components={{
                              // Style code blocks with syntax highlighting appearance
                              code: ({ node, inline, className, children, ...props }) => (
                                <code
                                  className={`${inline ? 'inline-code' : 'block-code'} ${className || ''}`}
                                  {...props}
                                >
                                  {children}
                                </code>
                              ),
                              // Ensure links open in new tabs and have proper styling
                              a: ({ node, children, href, ...props }) => (
                                <a 
                                  href={href}
                                  className="text-blue-500 hover:underline" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  {...props}
                                >
                                  {children}
                                </a>
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    <p
                      className={`text-xs text-muted-foreground mt-1 ${
                        msg.role === "user" ? "text-right" : "text-left"
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </CardContent>

        <CardFooter className="border-t p-4">
          <form
            className="flex w-full items-center space-x-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <Input
              placeholder="Type your message…"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              disabled={sending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || sending}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}

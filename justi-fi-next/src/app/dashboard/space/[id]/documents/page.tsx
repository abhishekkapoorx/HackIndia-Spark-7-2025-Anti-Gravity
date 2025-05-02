"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Upload } from "lucide-react";
import { toast } from "sonner";

interface DocumentItem {
  _id: string;
  title: string;
  fileType: string;
  fileSize: number;
  secureUrl: string;
  createdAt: string;
}

export default function DocumentsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id: spaceId } = params;

  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "pdf" | "docx" | "other">(
    "all"
  );

  // upload dialog state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  // fetch documents
  useEffect(() => {
    setLoading(true);
    fetch(`/api/spaces/${spaceId}/documents`)
      .then((res) => res.json())
      .then((data: DocumentItem[]) => setDocs(data))
      .catch((err) => {
        console.error("Failed to load documents", err);
        toast.error("Could not load documents");
      })
      .finally(() => setLoading(false));
  }, [spaceId]);

  // handle upload
  const handleUpload = async () => {
    if (!file) return;
    const form = new FormData();
    form.append("file", file);
    form.append("title", description);

    setLoading(true);
    const res = await fetch(`/api/spaces/${spaceId}/documents`, {
      method: "POST",
      body: form,
    });
    if (res.ok) {
      const doc: DocumentItem = await res.json();
      setDocs((prev) => [doc, ...prev]);
      toast.success("Document uploaded");
      setUploadOpen(false);
      setFile(null);
      setDescription("");
    } else {
      console.error("Upload failed", await res.json());
      toast.error("Upload failed");
    }
    setLoading(false);
  };

  // determine filtered list
  const filtered = docs.filter((doc) => {
    if (activeTab === "all") return true;
    const type = doc.fileType.toLowerCase();
    if (activeTab === "other") {
      return type !== "pdf" && type !== "docx";
    }
    return type === activeTab;
  });

  // format file size
  const formatSize = (bytes: number) =>
    bytes > 0 ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : "—";

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">
            Manage case-related documents
          </p>
        </div>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Select a file and add an optional description.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="file">File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
             
            </div>
            <DialogFooter>
              <Button
                onClick={handleUpload}
                disabled={!file || loading}
              >
                {loading ? "Uploading…" : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pdf">PDF</TabsTrigger>
          <TabsTrigger value="docx">Word</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0 min-h-[500px]">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {activeTab === "all"
                  ? "All Documents"
                  : activeTab === "pdf"
                  ? "PDF Documents"
                  : activeTab === "docx"
                  ? "Word Documents"
                  : "Other Documents"}
              </CardTitle>
              <CardDescription>
                {filtered.length} document{filtered.length !== 1 && "s"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
                  <div className="col-span-6">Name</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Date</div>
                </div>
                {loading ? (
                  <div className="p-4 min-w-4xl">Loading…</div>
                ) : filtered.length > 0 ? (
                  <div className="divide-y">
                    {filtered.map((doc) => (
                      <a
                        key={doc._id}
                        href={doc.secureUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="grid grid-cols-12 gap-4 p-4 hover:bg-muted cursor-pointer"
                      >
                        <div className="col-span-6 flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{doc.title}</span>
                        </div>
                        <div className="col-span-2 uppercase">{doc.fileType}</div>
                        <div className="col-span-2">{formatSize(doc.fileSize)}</div>
                        <div className="col-span-2">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="flex  flex-col items-center justify-center py-8 text-center min-w-4xl">
                    <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No documents found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

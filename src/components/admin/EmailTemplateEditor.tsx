import { useState } from "react";
import { Plus, Copy, GripVertical, Eye, Smartphone, Monitor, Tag, Trash2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { mockTemplates, MERGE_TAGS, type EmailTemplate, type TemplateBlock } from "@/data/mockTemplates";
import { useToast } from "@/hooks/use-toast";

const BLOCK_STYLES: Record<TemplateBlock["type"], string> = {
  header: "bg-primary/5 border-primary/20",
  body: "bg-card",
  cta: "bg-accent border-accent-foreground/10",
  footer: "bg-muted/50 border-muted-foreground/10",
  divider: "bg-transparent",
};

const BLOCK_LABELS: Record<TemplateBlock["type"], string> = {
  header: "Header",
  body: "Body",
  cta: "CTA Button",
  footer: "Footer",
  divider: "Divider",
};

export function EmailTemplateEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [blocks, setBlocks] = useState<TemplateBlock[]>([]);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const { toast } = useToast();

  const openEditor = (tpl: EmailTemplate) => {
    setSelectedTemplate(tpl);
    setBlocks([...tpl.blocks]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks((b) => b.map((block) => (block.id === id ? { ...block, content } : block)));
  };

  const addBlock = (type: TemplateBlock["type"]) => {
    setBlocks((b) => [...b, { id: `b-${Date.now()}`, type, content: "" }]);
  };

  const removeBlock = (id: string) => {
    setBlocks((b) => b.filter((block) => block.id !== id));
  };

  const insertMergeTag = (blockId: string, tag: string) => {
    setBlocks((b) => b.map((block) => (block.id === blockId ? { ...block, content: block.content + tag } : block)));
  };

  // Template List View
  if (!selectedTemplate) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockTemplates.map((tpl) => (
            <Card key={tpl.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openEditor(tpl)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{tpl.name}</CardTitle>
                  <Badge variant={tpl.status === "active" ? "default" : "secondary"} className="text-[10px]">{tpl.status}</Badge>
                </div>
                <CardDescription className="text-xs">Last edited: {new Date(tpl.lastEdited).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Used {tpl.timesUsed} times</span>
                  <span>Avg open: {tpl.avgOpenRate}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Editor View
  const renderPreview = (content: string) =>
    content.replace(/\{\{(\w+)\}\}/g, '<span class="bg-accent px-1 rounded text-xs font-mono">{{$1}}</span>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)}><ArrowLeft className="h-4 w-4 mr-1" /> Back</Button>
        <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toast({ title: "Saved", description: "Template saved as draft." })}>Save Draft</Button>
          <Button size="sm" onClick={() => toast({ title: "Activated", description: "Template is now active." })}>Activate</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Column */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Template Blocks</h4>
          {blocks.map((block) => (
            <Card key={block.id} className={`${BLOCK_STYLES[block.type]} border`}>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <Badge variant="outline" className="text-[10px]">{BLOCK_LABELS[block.type]}</Badge>
                  <div className="ml-auto flex gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 px-2"><Tag className="h-3 w-3" /></Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2" align="end">
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Insert merge tag</p>
                        <div className="flex flex-wrap gap-1">
                          {MERGE_TAGS.map((tag) => (
                            <Button key={tag} variant="outline" size="sm" className="h-6 text-[10px] font-mono" onClick={() => insertMergeTag(block.id, tag)}>{tag}</Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-destructive hover:text-destructive" onClick={() => removeBlock(block.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {block.type === "divider" ? (
                  <Separator />
                ) : (
                  <Textarea value={block.content} onChange={(e) => updateBlock(block.id, e.target.value)} className="text-sm min-h-[60px] resize-none" />
                )}
              </CardContent>
            </Card>
          ))}

          {/* Add Block */}
          <div className="flex gap-2 flex-wrap">
            <Select onValueChange={(v) => addBlock(v as TemplateBlock["type"])}>
              <SelectTrigger className="w-[180px]"><Plus className="h-4 w-4 mr-1" /><SelectValue placeholder="Add block..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="header">Header</SelectItem>
                <SelectItem value="body">Body</SelectItem>
                <SelectItem value="cta">CTA Button</SelectItem>
                <SelectItem value="divider">Divider</SelectItem>
                <SelectItem value="footer">Footer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview Column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-muted-foreground">Preview</h4>
            <div className="ml-auto flex gap-1">
              <Button variant={previewMode === "desktop" ? "secondary" : "ghost"} size="sm" className="h-7" onClick={() => setPreviewMode("desktop")}><Monitor className="h-3.5 w-3.5" /></Button>
              <Button variant={previewMode === "mobile" ? "secondary" : "ghost"} size="sm" className="h-7" onClick={() => setPreviewMode("mobile")}><Smartphone className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <div className={`border rounded-lg bg-background p-6 ${previewMode === "mobile" ? "max-w-[375px] mx-auto" : ""}`}>
            <div className="space-y-4">
              {blocks.map((block) => {
                if (block.type === "divider") return <Separator key={block.id} />;
                if (block.type === "header") return <h2 key={block.id} className="text-xl font-bold" dangerouslySetInnerHTML={{ __html: renderPreview(block.content) }} />;
                if (block.type === "cta") return (
                  <div key={block.id} className="text-center py-2">
                    <Button className="pointer-events-none">{block.content || "Button"}</Button>
                  </div>
                );
                if (block.type === "footer") return <p key={block.id} className="text-xs text-muted-foreground text-center" dangerouslySetInnerHTML={{ __html: renderPreview(block.content) }} />;
                return <div key={block.id} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: renderPreview(block.content) }} />;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

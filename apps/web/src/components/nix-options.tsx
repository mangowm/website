import { useState } from "react"; // used by OptionRow expand/collapse
import hmOptionsData from "../hm-options.json";
import nixosOptionsData from "../nixos-options.json";

interface NixOption {
  declarations: string[];
  default?: { _type: string; text: string };
  example?: { _type: string; text: string };
  description: string;
  loc: string[];
  readOnly: boolean;
  type: string;
}

interface NixOptionsProps {
  options: Record<string, NixOption>;
}

function stripNixMarkup(text: string) {
  return text
    .replace(/\{var\}`([^`]+)`/g, "`$1`")
    .replace(/\{option\}`([^`]+)`/g, "`$1`")
    .replace(/\{manpage\}`([^`]+)`/g, "`$1`")
    .replace(/\{file\}`([^`]+)`/g, "`$1`")
    .replace(/\{env\}`([^`]+)`/g, "`$1`")
    .replace(/:::\{\..*?\}/g, "")
    .replace(/:::/g, "")
    .trim();
}

const COLLAPSE_THRESHOLD = 6;

function CodeValue({ label, text }: { label: string; text: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = text.split("\n");
  const multiline = lines.length > 1;
  const collapsible = lines.length > COLLAPSE_THRESHOLD;
  const displayed = collapsible && !expanded ? lines.slice(0, COLLAPSE_THRESHOLD).join("\n") : text;

  return (
    <div className="w-full text-xs text-fd-muted-foreground">
      <span className="mr-1">{label}:</span>
      {multiline ? (
        <div className="relative mt-1">
          <pre className="overflow-x-auto rounded-md border border-fd-border bg-fd-muted/40 px-3 py-2 font-mono text-xs text-fd-foreground leading-relaxed">
            {displayed}
            {collapsible && !expanded && "…"}
          </pre>
          {collapsible && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-xs text-fd-primary hover:underline"
            >
              {expanded ? "show less" : `show all ${lines.length} lines`}
            </button>
          )}
        </div>
      ) : (
        <code className="bg-fd-muted px-1 py-0.5 rounded text-fd-foreground">{text}</code>
      )}
    </div>
  );
}

function OptionRow({ name, opt }: { name: string; opt: NixOption }) {
  const [expanded, setExpanded] = useState(false);
  const description = stripNixMarkup(opt.description ?? "");
  const lines = description.split("\n").filter(Boolean);
  const firstLine = lines[0] ?? "";
  const hasMore = lines.length > 1;

  return (
    <div className="border-b border-fd-border last:border-0 py-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <code className="text-sm font-bold text-fd-primary">{name}</code>
        <span className="text-xs text-fd-muted-foreground font-mono">{opt.type}</span>
      </div>

      <p className="mt-1.5 text-sm text-fd-foreground/80 leading-relaxed">
        {firstLine}
        {hasMore && !expanded && (
          <button onClick={() => setExpanded(true)} className="ml-1.5 text-xs text-fd-primary hover:underline">
            show more
          </button>
        )}
      </p>
      {expanded && (
        <p className="mt-1 text-sm text-fd-foreground/70 leading-relaxed whitespace-pre-wrap">
          {lines.slice(1).join("\n")}
          <button onClick={() => setExpanded(false)} className="ml-1.5 text-xs text-fd-primary hover:underline">
            show less
          </button>
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
        {opt.default && <CodeValue label="default" text={opt.default.text} />}
        {opt.example && <CodeValue label="example" text={opt.example.text} />}
      </div>
    </div>
  );
}

function NixOptions({ options }: NixOptionsProps) {
  const entries = Object.entries(options).filter(([name]) => name !== "_module.args");

  return (
    <div>
      {entries.map(([name, opt]) => (
        <OptionRow key={name} name={name} opt={opt} />
      ))}
    </div>
  );
}

export function HmOptions() {
  return <NixOptions options={hmOptionsData as Record<string, NixOption>} />;
}

export function NixosOptions() {
  return <NixOptions options={nixosOptionsData as Record<string, NixOption>} />;
}

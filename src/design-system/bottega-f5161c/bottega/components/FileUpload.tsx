import { forwardRef, useEffect, useId, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { Button } from "./Button";
import { cx } from "../lib/cx";
import { acceptsFile } from "../lib/files";

export interface FileUploadProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  label: string;
  children?: ReactNode;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  name?: string;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  onReject?: (files: File[]) => void;
  error?: string;
  variant?: "default" | "accent";
  size?: "sm" | "md";
  browseLabel?: string;
}

/** Photo selection with a keyboard-accessible picker, drag/drop and local previews. Does not upload to a server. */
export const FileUpload = forwardRef<HTMLDivElement, FileUploadProps>(function FileUpload(
  { label, children, accept = "image/*", multiple = true, disabled = false, name, files, onFilesChange, onReject,
    error, variant = "default", size = "md", browseLabel = "Choose photos", className, ...props }, ref,
) {
  const input = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const id = useId();
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [rejection, setRejection] = useState("");
  const [previews, setPreviews] = useState<string[]>([]);
  const selected = files ?? localFiles;
  const message = error || rejection;
  useEffect(() => {
    const urls = selected.map((file) => file.type.startsWith("image/") ? URL.createObjectURL(file) : "");
    setPreviews(urls);
    return () => urls.forEach((url) => { if (url) URL.revokeObjectURL(url); });
  }, [selected]);
  function update(next: File[]) {
    setLocalFiles(next);
    onFilesChange?.(next);
  }
  function select(incoming: File[]) {
    if (disabled) return;
    const rejected = incoming.filter((file) => !acceptsFile(file, accept));
    const accepted = incoming.filter((file) => acceptsFile(file, accept));
    setRejection(rejected.length ? "Some files aren’t supported. Choose a matching file type." : "");
    if (rejected.length) onReject?.(rejected);
    if (accepted.length) update(multiple ? [...selected, ...accepted] : accepted.slice(0, 1));
  }
  return (
    <div {...props} ref={ref} className={cx("bt-upload", `bt-upload--${variant}`, `bt-upload--${size}`, dragging && "is-dragging", disabled && "is-disabled", className)}>
      <span className="bt-upload__label" id={`${id}-label`}>{label}</span>
      <div className={cx("bt-upload__zone", message && "is-invalid")}
        onDragEnter={(event) => { event.preventDefault(); if (!disabled) { depth.current += 1; setDragging(true); } }}
        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = disabled ? "none" : "copy"; }}
        onDragLeave={(event) => { event.preventDefault(); depth.current = Math.max(0, depth.current - 1); if (!depth.current) setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); depth.current = 0; setDragging(false); select(Array.from(event.dataTransfer.files)); }}>
        <Button variant="ghost" className="bt-upload__picker" disabled={disabled} onClick={() => input.current?.click()}
          aria-labelledby={`${id}-label ${id}-browse`} aria-describedby={`${id}-hint${message ? ` ${id}-error` : ""}`}>
          <svg className="bt-upload__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8" cy="8" r="1.5" /><path d="m3 17 5-5 4 4 4-6 5 7" />
          </svg>
          <span id={`${id}-browse`}>{dragging ? "Drop photos here" : browseLabel}</span>
          <span className="bt-upload__hint" id={`${id}-hint`}>{children ?? "Drag photos here or click to browse"}</span>
        </Button>
        <input ref={input} id={id} name={name} type="file" accept={accept} multiple={multiple} disabled={disabled} hidden
          onChange={(event) => { select(Array.from(event.currentTarget.files ?? [])); event.currentTarget.value = ""; }} />
      </div>
      <div className="bt-upload__status" aria-live="polite">{message ? <span id={`${id}-error`} className="bt-upload__error">{message}</span> : selected.length > 0 ? `${selected.length} ${selected.length === 1 ? "file" : "files"} selected` : null}</div>
      {selected.length > 0 && <ul className="bt-upload__files">{selected.map((file, index) => (
        <li key={`${file.name}-${file.lastModified}-${index}`} className="bt-upload__file">
          {previews[index] && <img className="bt-upload__preview" src={previews[index]} alt="" />}
          <span className="bt-upload__filename">{file.name}</span>
          <Button size="sm" variant="ghost" disabled={disabled} aria-label={`Remove ${file.name}`} title={`Remove ${file.name}`}
            className="bt-upload__remove" onClick={() => update(selected.filter((_, i) => i !== index))}>
            <svg className="bt-upload__remove-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </Button>
        </li>
      ))}</ul>}
    </div>
  );
});

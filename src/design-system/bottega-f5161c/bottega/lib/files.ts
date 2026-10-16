/** Match native file-input accept rules for both picker and drop selections. */
export function acceptsFile(file: Pick<File, "name" | "type">, accept: string): boolean {
  return accept.split(",").some((entry) => {
    const rule = entry.trim().toLowerCase();
    if (!rule) return true;
    if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
    if (rule.endsWith("/*")) return file.type.toLowerCase().startsWith(rule.slice(0, -1));
    return file.type.toLowerCase() === rule;
  });
}

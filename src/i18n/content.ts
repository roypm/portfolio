import { defaultLocale, type Locale } from "./ui";

type Entry = { id: string };

export function localizedEntries<T extends Entry>(entries: T[], locale: Locale) {
  const groups = new Map<string, T[]>();

  for (const entry of entries) {
    const slash = entry.id.indexOf("/");
    if (slash === -1) continue;
    const slug = entry.id.slice(slash + 1);
    const group = groups.get(slug) ?? [];
    group.push(entry);
    groups.set(slug, group);
  }

  const picked: T[] = [];
  for (const group of groups.values()) {
    const match =
      group.find((entry) => entry.id.startsWith(`${locale}/`)) ??
      group.find((entry) => entry.id.startsWith(`${defaultLocale}/`));
    if (match) picked.push(match);
  }

  return picked;
}

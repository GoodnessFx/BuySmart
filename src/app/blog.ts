type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  image?: string;
  body: string[];
};

const rawPosts = import.meta.glob("../content/blog/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function parseFrontMatter(raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!match) {
    return {
      meta: {} as Record<string, string>,
      content: raw.trim(),
    };
  }

  const [, frontMatter, content] = match;
  const meta = frontMatter
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return acc;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim().replace(/^"|"$/g, "");
      acc[key] = value;
      return acc;
    }, {});

  return {
    meta,
    content: content.trim(),
  };
}

function toParagraphs(content: string) {
  return content
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

export const blogPosts: BlogPost[] = Object.entries(rawPosts)
  .map(([path, raw]) => {
    const { meta, content } = parseFrontMatter(raw);
    const slug = path.split("/").pop()?.replace(/\.mdx$/, "") ?? "";

    return {
      slug,
      title: meta.title ?? slug,
      category: meta.category ?? "Updates",
      date: meta.date ?? "",
      readTime: meta.readTime ?? "",
      excerpt: meta.excerpt ?? "",
      body: toParagraphs(content),
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

export function getPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export type { BlogPost };

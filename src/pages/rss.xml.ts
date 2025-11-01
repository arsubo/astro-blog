import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";

import sanitizeHtml from "sanitize-html";

const parser = new MarkdownIt();

function buildImageTag(siteUrl: string, image: any) {
  if (!image) return "";
  // image as string path
  if (typeof image === "string") {
    const ext = (image.split(".").pop() || "png").toLowerCase();
    const type = ext === "jpg" ? "jpeg" : ext;
    return `<media:content type="image/${type}" url="${siteUrl + image}" />`;
  }
  // image as object
  const fmt = image.format === "jpg" ? "jpeg" : image.format ?? "png";
  const width = image.width ? ` width="${image.width}"` : "";
  const height = image.height ? ` height="${image.height}"` : "";
  const url = siteUrl + (image.src ?? "");
  return `<media:content type="image/${fmt}"${width}${height} medium="image" url="${url}" />`;
}

export const GET: APIRoute = async ({ params, request, site }) => {
  const blogPosts = await getCollection("blog");
  const siteUrl = site ? String(site).replace(/\/$/, "") : "";

  return rss({
    //stylesheet: "/styles/rss.xsl",
    title: "Arnoldo’s Blog",
    description: "Mi blog sobre mis aventuras con Astro",
    xmlns: {
      media: "http://search.yahoo.com/mrss/",
    },
    site: site!,
    items: blogPosts.map(({ data, slug, body }) => {
      const imageTag = buildImageTag(siteUrl, data.image);
      return {
        title: data.title,
        pubDate: data.date,
        description: data.description,
        link: `posts/${slug}`,
        content: sanitizeHtml(parser.render(body), {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        }),
        customData: imageTag || undefined,
      };
    }),
    customData: `<language>es-mx</language>`,
  });
};

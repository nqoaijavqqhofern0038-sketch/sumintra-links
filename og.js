const P = "sumintra-links";
const K = "AIzaSyDGyOYgNIvEDAxwVEorqEgeWiN4BkU6-sI";

export default async (req, context) => {
  const res = await context.next();
  if (!(res.headers.get("content-type") || "").includes("text/html")) return res;
  let html = await res.text();
  let name = "ลิงก์ร้าน", desc = "", img = "";
  try {
    const r = await fetch(`https://firestore.googleapis.com/v1/projects/${P}/databases/(default)/documents/sites/main?key=${K}`);
    const j = await r.json();
    const s = j.fields?.shop?.mapValue?.fields || {};
    const g = k => s[k]?.stringValue || "";
    name = g("name") || name;
    desc = g("tag") || g("desc");
    img = g("avatar");
    if (img.startsWith("data:")) img = "";
  } catch (e) {}
  const esc = t => String(t).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const url = new URL(req.url).origin + "/";
  const tags = `
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(name)}">
<meta property="og:description" content="${esc(desc)}">
${img ? `<meta property="og:image" content="${esc(img)}">
<meta name="twitter:image" content="${esc(img)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
`;
  html = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(name)}</title>`)
    .replace("</head>", tags + "</head>");
  const h = new Headers(res.headers);
  h.delete("content-length");
  h.set("cache-control", "public, max-age=0, must-revalidate");
  return new Response(html, { status: res.status, headers: h });
};

export const config = { path: "/" };

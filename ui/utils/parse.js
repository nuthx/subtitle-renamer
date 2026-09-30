import { load } from "cheerio"
import dayjs from "dayjs"

import { ARCHIVE_EXTENSIONS, SUBTITLE_EXTENSIONS } from "@/utils/detect"

function parsePagination(url, $) {
  const nextHref = $(".pg a.nxt").first().attr("href")
  if (!nextHref) return { nextPageUrl: null, nextPageLabel: null }

  const pageNumber = (href) => {
    const link = new URL(href, url)
    return Number(link.searchParams.get("page") || link.pathname.match(/thread-\d+-(\d+)-\d+\.html$/)?.[1] || 0)
  }
  const nextPage = pageNumber(nextHref)
  const pageNumbers = $(".pg a[href]")
    .toArray()
    .map((link) => pageNumber($(link).attr("href")))
  const totalPages = Math.max(...pageNumbers)

  return {
    nextPageUrl: new URL(nextHref, url).href,
    nextPageLabel: nextPage ? `(${nextPage - 1}/${totalPages || "?"})` : null,
  }
}

function parseSearchPage(url, $) {
  const items = $(".slst li, #threadlist li, .pbw").toArray()
  const seen = new Set()
  const results = items.flatMap((item) => {
    const $item = $(item)
    const $link = $item
      .find('h3 a[href*="viewthread"], h3 a[href*="thread-"], a.xst[href*="viewthread"], a.xst[href*="thread-"]')
      .first()
    if (!$link.length) return []

    const href = new URL($link.attr("href"), url).href
    const hrefUrl = new URL(href)
    const id = hrefUrl.searchParams.get("tid") || href.match(/thread-(\d+)/)?.[1] || href
    if (seen.has(id)) return []
    seen.add(id)

    const stats = $item.find("p.xg1").first().text().trim()
    const dateSource = $item
      .find("span")
      .text()
      .match(/\d{4}-\d{1,2}-\d{1,2}/)?.[0]

    return [
      {
        id,
        url: href,
        title: $link.text().trim(),
        date: dateSource ? dayjs(dateSource).format("YYYY-MM-DD") : "",
        views: stats.match(/(\d[\d,]*)\s*(?:次)?查看/)?.[1] || "",
        replies: stats.match(/(\d[\d,]*)\s*(?:个)?回复/)?.[1] || "",
      },
    ]
  })

  return {
    kind: "search",
    results,
    ...parsePagination(url, $),
  }
}

function parsePostPage(url, $) {
  const seen = new Set()
  const files = $('a[href*="mod=attachment"][href*="aid="]')
    .toArray()
    .flatMap((link) => {
      const $link = $(link)
      const name = $link.text().trim()
      const extension = name.split(".").pop()?.toLowerCase() || ""
      const subtitleExtensions = new Set([...SUBTITLE_EXTENSIONS, ...ARCHIVE_EXTENSIONS])
      if (!subtitleExtensions.has(extension)) return []

      const href = new URL($link.attr("href"), url).href
      const id = new URL(href).searchParams.get("aid") || href
      if (seen.has(id)) return []
      seen.add(id)

      const $container = $link.closest("dl.tattl, dl, li, .attach, .tattl")
      const context = ($container.length ? $container.text() : $link.parent().text()).trim()

      return [
        {
          id,
          name,
          url: href,
          extension,
          description: $container.find("p.xg2").first().text().trim(),
          size: context.match(/\d+(?:\.\d+)?\s*(?:B|KB|MB|GB)/i)?.[0] || "",
          downloads:
            context.match(/下载次数\s*[:：]?\s*(\d[\d,]*)/)?.[1] || context.match(/(\d[\d,]*)\s*次下载/)?.[1] || "",
        },
      ]
    })

  return {
    kind: "post",
    files,
    ...parsePagination(url, $),
  }
}

export function parseAcgripPage(snapshot) {
  const url = new URL(snapshot.url)
  const $ = load(snapshot.html)

  const isSearchPage =
    url.pathname.endsWith("/search.php") &&
    (url.searchParams.get("searchsubmit") === "yes" || url.searchParams.has("searchid"))
  if (isSearchPage) return parseSearchPage(url, $)

  const isPostPage =
    (url.pathname.endsWith("/forum.php") && url.searchParams.get("mod") === "viewthread") ||
    /\/thread-\d+-\d+-\d+\.html$/.test(url.pathname)
  if (isPostPage) return parsePostPage(url, $)

  return null
}

/**
 * Centralized XSS sanitization helper.
 * Use sanitizeHtml() for any value that will be passed to dangerouslySetInnerHTML.
 * Use sanitizeText() to strip all HTML when you only want plain text.
 */
import DOMPurify from "dompurify";

export const sanitizeHtml = (dirty: string): string =>
  DOMPurify.sanitize(dirty ?? "", {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li", "code", "pre", "span"],
    ALLOWED_ATTR: ["href", "title", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
  });

export const sanitizeText = (dirty: string): string =>
  DOMPurify.sanitize(dirty ?? "", { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

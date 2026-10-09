import { Content } from "react-native-nobodywho";

// Message content can be plain text, interleaved text/media parts, or raw JSON.
// For display we only care about the text.
export const getContentText = (content: Content): string => {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (part.type === "text" ? part.text : ""))
      .join("");
  }
  return content.json;
};

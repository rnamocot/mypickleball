import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MyPickleball",
    short_name: "MyPickleball",
    description: "Pickleball club management software",
    start_url: "/",
    display: "standalone",
    background_color: "#07090a",
    theme_color: "#07090a",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bengala",
    short_name: "Bengala",
    description:
      "Señal de auxilio y acompañamiento para compartir ubicación y documentación durante el viaje.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b1020",
    theme_color: "#0b1020",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon.svg", sizes: "any", type: "image/svg+xml" }
    ]
  };
}


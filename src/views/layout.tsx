import { html, raw } from "hono/html";
import { PropsWithChildren } from "hono/jsx";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

interface LayoutProps {
  title: string;
  children?: any;
}

export function Layout(props: PropsWithChildren<LayoutProps>) {
  return (
    <html lang="da">
      <head>
        <meta charset="UTF-8" />
        <title>${props.title}</title>
        <link rel="icon" href="/gozy_logo.png" type="image/png" />
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <script
          src="https://unpkg.com/htmx.org@2.0.4"
          integrity="sha384-HGfztofotfshcF7+8n44JQL2oJmowVChPTg48S+jvZoztPfvwD79OC/LTtG6dMp+"
          crossorigin="anonymous"
        ></script>
        <script
          src="https://unpkg.com/htmx-ext-sse@2.2.2/sse.js"
          crossorigin="anonymous"
        ></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* @ts-ignore */}
        <style type="text/tailwindcss">
          {`
          @theme {
            --background: 0 0% 100%;
          --foreground: 222.2 84% 4.9%;
          --color-muted-500: 217.2 32.6% 17.5%;
          }
          .markdown-content h1 {
            @apply text-3xl font-bold mb-6 mt-8 text-gray-900;
          }
          .markdown-content h2 {
            @apply text-2xl font-semibold mb-4 mt-6 text-gray-800;
          }
          .markdown-content h3 {
            @apply text-xl font-semibold mb-3 mt-5 text-gray-700;
          }
          .markdown-content p {
            @apply mb-4 leading-relaxed text-gray-600;
          }
          .markdown-content ul {
            @apply list-disc pl-6 mb-4 text-gray-600;
          }
          .markdown-content ol {
            @apply list-decimal pl-6 mb-4 text-gray-600;
          }
          .markdown-content li {
            @apply mb-2;
          }
          .markdown-content a {
            @apply text-blue-600 underline hover:text-blue-800;
          }
          .markdown-content strong {
            @apply font-semibold text-gray-900;
          }
        `}
        </style>
      </head>
      <body class="flex flex-col min-h-screen">
        <Header />
        <main class="flex-grow">{props.children}</main>
        <Footer />
      </body>
    </html>
  );
}

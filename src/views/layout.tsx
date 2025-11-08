import { html, raw } from "hono/html";
import { PropsWithChildren } from "hono/jsx";

interface LayoutProps {
  title: string;
  children?: any;
}

export function Layout(props: PropsWithChildren<LayoutProps>) {
  return html`
    <!DOCTYPE html>
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
        <style type="text/tailwindcss">
          @theme {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --color-muted-500: 217.2 32.6% 17.5%;
          }
        </style>
      </head>
      <body>
        ${props.children}
      </body>
    </html>
  `;
}

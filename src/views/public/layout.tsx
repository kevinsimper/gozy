import { html } from "hono/html";
import { PropsWithChildren } from "hono/jsx";

interface PublicLayoutProps {
  title: string;
  children?: any;
}

export function PublicLayout(props: PropsWithChildren<PublicLayoutProps>) {
  return html`
    <!DOCTYPE html>
    <html lang="da">
      <head>
        <meta charset="UTF-8" />
        <title>${props.title}</title>
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style type="text/tailwindcss">
          @theme {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --color-muted-500: 217.2 32.6% 17.5%;
          }
        </style>
      </head>
      <body
        class="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      >
        <div class="w-full max-w-md">${props.children}</div>
      </body>
    </html>
  `;
}

import { NextResponse } from "next/server"

export async function GET() {
  const swaggerHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>ECO HUB KOSOVA API Documentation</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
        <style>
          html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
          }
          *, *:before, *:after {
            box-sizing: inherit;
          }
          body {
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
          }
          .swagger-ui {
            max-width: 1460px;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-standalone-preset.js"></script>
        <script>
          const ui = SwaggerUIBundle({
            url: '/openapi.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: 'BaseLayout'
          })
          window.onload = function() {
            // You can add custom logic here
          }
        </script>
      </body>
    </html>
  `
  return new NextResponse(swaggerHtml, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}

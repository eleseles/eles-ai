import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Eles AI</title>
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}

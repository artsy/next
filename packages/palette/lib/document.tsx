import React from "react";
import NextDocument, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document";
import { ServerStyleSheet } from "styled-components";
import { injectGlobalStyles, Theme } from "@artsy/palette";

const { GlobalStyles } = injectGlobalStyles();

export class Document extends NextDocument {
  static async getInitialProps(ctx: DocumentContext): Promise<any> {
    const { renderPage } = ctx;
    const sheet = new ServerStyleSheet();

    ctx.renderPage = () =>
      renderPage({
        // @ts-ignore
        enhancedApp: (App) => (props) =>
          sheet.collectStyles(<App {...props} />),
      });

    const initialProps = await NextDocument.getInitialProps(ctx);

    const styleTags = sheet.getStyleElement();

    return { ...initialProps, styleTags };
  }

  render() {
    return (
      <Html>
        <Head>
          <GlobalStyles />
          <style>{`
            * {
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }

            #__next {
              height: 100%;
              padding: 0;
              margin: 0;
            }
          `}</style>
          <link
            type="text/css"
            rel="stylesheet"
            href="https://webfonts.artsy.net/all-webfonts.css"
          />
          {(this.props as any).styleTags}
        </Head>
        <body>
          <Theme>
            <Main />
          </Theme>
          <NextScript />
        </body>
      </Html>
    );
  }
}

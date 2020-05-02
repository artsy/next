# `@artsy/next-palette`

This package helps easily integrate [Artsy]'s [Palette](https://github.com/artsy/palette) with [Next.js](https://nextjs.org/).

## Installation

```
yarn add @artsy/next-palette
```

## Usage

Create a `_document.tsx` or `_document.jsx` in the root of your [pages](https://nextjs.org/docs/basic-features/pages) directory. Add the following code:

```
export { Document as default } from "@artsy/next-palette";
```

Next, create an `_app.tsx` or `_app.jsx` (unless you already have one), and wrap its contents in Palette's `Theme` component.

```
import { Theme } from "@artsy/palette";

export default function App({ Component, pageProps }) {
  return (
    <Theme>
      <Component {...pageProps}/>
    </Theme>
  )
}
```

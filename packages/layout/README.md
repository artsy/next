# @artsy/next-layout

This package provides a new mechanism for creating shared layouts in `Next.js`. Inspired by [this article](https://adamwathan.me/2019/10/17/persistent-layout-patterns-in-nextjs/), this package enables you to create a new `_layout` file anywhere in your `pages` directory to automatically provide a layout for all pages in that directory and its children.

## Installation

```
yarn add @artsy/next-layout
```

If you don't have one yet, create a `.babelrc` at the root of your Next.js project and add the following

```js
module.exports = {
  presets: ["next/babel"],
  plugins: ["@artsy/next-layout/babel"],
};
```

If you don't already have a `_app.tsx` or `_app.jsx` in your pages directory go ahead and create one. You'll need the following content:

```js
import React from "react";
import { Layout } from "@artsy/next-layout";

export function App(props) {
  return <Layout {...props} />;
}
```

If you've already got an `_app` file and have made modifications to it, that's fine! Instead of returning `Component` from the props, make sure you pass props to `Layout` and return that instead.

## Usage

### Creating a layout

Inside the `pages` directory of your next.js app create a `_layout.tsx` or `_layout.jsx` in whatever directory you'd like to provide a layout for. If you put it in the root (`pages`) then all pages of your Next.js site would by default have that layout. If you place it in the `pages/blog` directory, then all pages in the `blog` directory will have that layout.

A `_layout` file must have a _named_ export of `Layout`.

```
export const Layout = ({ children }) => {
  return (
    <>
      <h1>Welcome to my site!</h1>
      {children}
    </>
}
```

The `children` prop passed to `Layout` is the Next.js page being rendered. `Layout` will also be passed any props that the Next.js page would receive.

### Overriding a layout

If you have a particular page you'd like to override the layout on then doing so is pretty easy! In your page file, simply define a `Layout` property attached to your exported component.

```
const MyPage = () => {
  return <p>Lorem Ipsum</p>
}

MyPage.Layout = ({ children }) => {
  return (
    <>
      <h1>This is a layout override</h1>
      {children}
    </>
  )
}

export MyPage;
```

If you'd just like to _disable_ the layout, you can do so by setting the `Layout` property to `null`.

```
const MyPage = () => {
  return <p>Lorem Ipsum</p>
}

// This will disable the page's layout
MyPage.Layout = null;

export MyPage;
```

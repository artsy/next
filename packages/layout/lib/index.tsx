import React, { FC } from "react";
import { AppProps } from "next/app";

type LayoutComponent = FC<Omit<AppProps, "Component">>;

export const Layout: FC<AppProps> = ({ Component, pageProps }) => {
  const DynamicLayout: LayoutComponent = (Component as any).Layout;
  return DynamicLayout ? (
    <DynamicLayout {...pageProps}>
      <Component {...pageProps} />
    </DynamicLayout>
  ) : (
    <Component {...pageProps} />
  );
};

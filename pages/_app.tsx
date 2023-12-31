import React from "react";
import Head from "next/head";
import type { AppProps } from "next/app";
import "./global.css";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Analytics } from "@vercel/analytics/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider activeChain={"ethereum"}>
      <Head>
        <title>DeCreepies</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="icon" href="favicon.ico" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </ThirdwebProvider>
  );
}

export default MyApp;

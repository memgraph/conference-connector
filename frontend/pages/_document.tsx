import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <link href="https://fonts.googleapis.com/css2?family=Encode+Sans+Condensed:wght@500;600&family=Roboto:wght@400;500;700&display=swap" rel="stylesheet"></link>
                <script src="https://kit.fontawesome.com/1209cef04b.js" crossOrigin="anonymous"></script>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}


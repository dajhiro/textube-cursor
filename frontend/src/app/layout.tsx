import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TexTube - 링크 기반 지식 수집 플랫폼',
  description: '영어/한국어 자료를 자동으로 요약하고 고품질 번역을 제공하는 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}


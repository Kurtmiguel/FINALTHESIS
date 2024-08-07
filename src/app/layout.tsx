import React, { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css'

export const metadata: Metadata = {
  title: 'Your App Name',
  description: 'Description of your app',
};

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
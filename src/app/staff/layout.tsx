import { Outfit } from 'next/font/google';
import '@/app/globals.css';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.className} dark:bg-gray-900`}>
        {children}
      </body>
    </html>
  );
}

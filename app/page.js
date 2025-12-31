import { Button } from "@/components/ui/button";
import { NoiseBackground } from "@/components/ui/noise-background";
import { Rocket, ZapIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative w-full h-screen">
      <Image
        src={"/hero.jpeg"}
        alt="Hero Image"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark overlay to improve text contrast */}
      <div className="absolute inset-0 bg-black/70 pointer-events-none" />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col justify-start pt-40 px-16">
        {/* Logo */}
        <div className="text-white text-3xl font-bold text-right absolute top-8 right-12">
          <Image src={"/logo.svg"} alt="Logo" width={185} height={185} />
        </div>

        {/* Main content */}
        <div className="w-full max-w-3xl">
          {/* Heading */}
          <h1 className="font-semibold text-5xl lg:text-6xl leading-tight text-white mb-6">
            Fix the gap between your resume and real job roles.
          </h1>

          {/* Description */}
          <p className="text-gray-300 text-[20px] font-medium mb-12 leading-relaxed">
            AI that understands real job expectations, exposes skill gaps, and
            evolves your resume based on evidence — not keywords.
          </p>

          {/* Bullet points */}
          <div className="text-gray-300 text-lg font-medium mb-9 space-y-4">
            <li> Built for students and early-career professionals.</li>
            <li>
              {" "}
              Designed for freshers, career switchers, and placement-focused
              students.
            </li>
          </div>

          {/* Buttons */}
          <div className="flex gap-6 items-center">
            <Link href={"/login"}>
              <Button
                size="lg"
                className="bg-transparent bg-linear-to-r from-amber-600 via-amber-600/60 to-amber-600 bg-size-[200%_auto] text-white hover:bg-transparent hover:bg-position-[99%_center] focus-visible:ring-amber-600/20 dark:from-amber-400 dark:via-amber-400/60 dark:to-amber-400 dark:focus-visible:ring-amber-400/40"
              >
                Get Started <Rocket />
              </Button>
            </Link>
            <Button
              size="lg"
              className="from-primary border shadow-2xl bg-transparent bg-linear-to-r hover:bg-transparent hover:underline underline-offset-4"
            >
              See How it works ▶
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

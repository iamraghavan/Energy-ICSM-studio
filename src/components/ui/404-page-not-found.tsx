"use client";

import { Button } from "@/components/ui/button";
import Link from 'next/link';

export function NotFoundPage() {
  return (
    <section className="bg-background min-h-screen flex items-center justify-center p-4">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <div className="w-full sm:w-10/12 md:w-8/12 text-center">
            <div
              className="bg-[url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)] h-[250px] sm:h-[350px] md:h-[400px] bg-center bg-no-repeat bg-contain"
              aria-hidden="true"
            >
              <h1 className="text-center text-foreground text-6xl sm:text-7xl md:text-8xl pt-6 sm:pt-8 font-headline">
                404
              </h1>
            </div>

            <div className="mt-[-50px] sm:mt-[-30px]">
              <h3 className="text-2xl text-foreground sm:text-3xl font-bold font-headline mb-4">
                Look like you're lost
              </h3>
              <p className="mb-6 text-muted-foreground sm:mb-5">
                The page you are looking for is not available!
              </p>

              <Button asChild size="lg">
                <Link href="/">Go to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import type { ReactNode } from "react";

interface HeroSectionProps {
  children?: ReactNode;
}

export function HeroSection({ children }: HeroSectionProps) {
  return (
    <section
      className="relative flex min-h-[500px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#b50346] to-[#7a022f] sm:min-h-[600px] lg:min-h-[650px]"
      style={
        {
          // TODO: replace with actual campus image
          // backgroundImage: 'url(/images/campus.jpg)',
          // backgroundSize: 'cover',
          // backgroundPosition: 'center',
        } as React.CSSProperties
      }
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#b50346]/95 to-[#7a022f]/90" />
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Find Your Course, Instantly
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg">
          Search courses, credits, semesters, electives and curriculum
          information across programs.
        </p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

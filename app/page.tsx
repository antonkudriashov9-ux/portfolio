import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CommandMenu } from "@/components/command-menu";
import { Terminal } from "@/components/terminal";
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { About } from "@/components/sections/about";
import { Projects } from "@/components/sections/projects";
import { Experience } from "@/components/sections/experience";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <About />
        <Projects />
        <Experience />
        <Contact />
      </main>
      <Footer />
      <CommandMenu />
      <Terminal />
    </>
  );
}

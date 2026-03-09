import { useEffect, useRef } from "react";

export default function Footer() {
  const glowRef = useRef(null);

  useEffect(() => {
    const moveGlow = (e) => {
      const glow = glowRef.current;
      if (glow) {
        // We use pageX/pageY if the footer is at the bottom, 
        // but since it's relative to the footer container, clientX/Y is fine 
        // if we calculate relative position or just use absolute positioning within the container.
        const rect = glow.parentElement.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        glow.style.left = x + "px";
        glow.style.top = y + "px";
      }
    };

    window.addEventListener("mousemove", moveGlow);
    return () => window.removeEventListener("mousemove", moveGlow);
  }, []);

  return (
    <footer className="relative flex items-center justify-center h-[40vh] md:h-[60vh] bg-slate-900 overflow-hidden">
      {/* Background Subtle Gradient to match Home */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-900/10 pointer-events-none"></div>

      {/* Text */}
      <h1
        className="text-[4.5rem] sm:text-[10rem] md:text-[20rem] font-extrabold tracking-tighter sm:tracking-widest text-transparent z-10 opacity-40 select-none px-4 text-center"
        style={{ WebkitTextStroke: "1px rgba(255,255,255,0.5)" }}
      >
        NextGen
      </h1>

      {/* Glow - Using accent-500 from theme */}
      <div
        ref={glowRef}
        className="absolute w-[400px] h-[400px] rounded-full bg-accent-500 blur-[100px] opacity-20 pointer-events-none transition-opacity duration-300"
        style={{ transform: "translate(-50%, -50%)", left: "-100%", top: "-100%" }}
      />

      <div className="absolute bottom-10 left-0 right-0 z-20 flex flex-col items-center justify-center gap-2">
        <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">
          © {new Date().getFullYear()} NextGen Institutes
        </p>
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-30"></div>
      </div>
    </footer>
  );
}

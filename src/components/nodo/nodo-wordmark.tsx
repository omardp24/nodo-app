import { cn } from "@/lib/utils";

interface NodoWordmarkProps {
  className?: string;
  /** Tamaño del texto "Nodo" — el resto (puntos, gap) escala en proporción vía CSS. */
  tamanoTexto?: string;
}

/**
 * Logo de marca: grilla 2x2 de puntos (azul/naranja) + wordmark "Nodo.".
 * En tema oscuro toda la marca (puntos, texto y el punto final) pasa a blanco
 * — una versión "reversed" tradicional para fondos oscuros, no un simple
 * ajuste de contraste — vía las variantes dark: de Tailwind, ya soportadas
 * en este proyecto (@custom-variant dark en globals.css).
 */
export function NodoWordmark({ className, tamanoTexto = "text-3xl" }: NodoWordmarkProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <div className="grid shrink-0 grid-cols-2 gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#1E88E5] dark:bg-white" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF7043] dark:bg-white" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#1E88E5] dark:bg-white" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF7043] dark:bg-white" />
      </div>
      <span className={cn("font-bold leading-none tracking-tight text-foreground", tamanoTexto)}>
        Nodo
        <span className="text-[#FF7043] dark:text-white">.</span>
      </span>
    </div>
  );
}

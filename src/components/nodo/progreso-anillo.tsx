"use client";

interface ProgresoAnilloProps {
  hechos: number;
  total: number;
  size?: number;
}

export function ProgresoAnillo({ hechos, total, size = 74 }: ProgresoAnilloProps) {
  const radio = size / 2 - 5;
  const centro = size / 2;
  const proporcion = total > 0 ? hechos / total : 0;
  const offset = 100 - proporcion * 100;
  const gradientId = "nodo-progreso-gradiente";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={centro} cy={centro} r={radio} fill="none" stroke="var(--secondary)" strokeWidth={7} />
        <circle
          cx={centro}
          cy={centro}
          r={radio}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={7}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset .6s cubic-bezier(.3,1.2,.5,1)" }}
        />
        <defs>
          <linearGradient id={gradientId} x1="0" y1={size} x2={size} y2="0">
            <stop offset="0" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--warning)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-px">
        <span className="text-[17px] font-bold leading-none tabular-nums text-foreground">
          {hechos}/{total}
        </span>
        <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">listos</span>
      </div>
    </div>
  );
}

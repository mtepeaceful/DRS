import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from 'react';
import styles from './GraficoDePontos.module.css';

export interface Serie {
  nome: string;
  cor: string;
  valores: number[];
}

interface Props {
  series: [Serie, Serie];
  nomeDaEtapa: (rodada: number) => string;
}

const ALTURA = 280;
const DISTANCIA_MINIMA_DOS_ROTULOS = 18;
const MARGEM = { topo: 16, direita: 48, base: 32, esquerda: 44 };

function passoRedondo(bruto: number) {
  const ordem = 10 ** Math.floor(Math.log10(bruto));

  return ([1, 2, 2.5, 5, 10].find((fator) => fator * ordem >= bruto) ?? 10) * ordem;
}

function escalaY(maximo: number) {
  const passo = passoRedondo(Math.max(maximo, 1) / 4);
  const topo = Math.ceil(Math.max(maximo, 1) / passo) * passo;

  return { topo, marcas: Array.from({ length: topo / passo + 1 }, (_, i) => i * passo) };
}

function useLargura<Elemento extends HTMLElement>() {
  const ref = useRef<Elemento>(null);
  const [largura, setLargura] = useState(0);

  useEffect(() => {
    const elemento = ref.current;

    if (!elemento) {
      return;
    }

    const observador = new ResizeObserver(([entrada]) => {
      setLargura(Math.round(entrada?.contentRect.width ?? 0));
    });
    observador.observe(elemento);

    return () => observador.disconnect();
  }, []);

  return [ref, largura] as const;
}

export function GraficoDePontos({ series, nomeDaEtapa }: Props) {
  const [ref, largura] = useLargura<HTMLDivElement>();
  const [ativa, setAtiva] = useState<number | null>(null);
  const etapas = series[0].valores.length;
  const { topo, marcas } = escalaY(Math.max(...series.flatMap((serie) => serie.valores)));
  const areaX = Math.max(largura - MARGEM.esquerda - MARGEM.direita, 1);
  const areaY = ALTURA - MARGEM.topo - MARGEM.base;

  const x = (indice: number) =>
    MARGEM.esquerda + (etapas > 1 ? (indice / (etapas - 1)) * areaX : areaX / 2);
  const y = (valor: number) => MARGEM.topo + areaY - (valor / topo) * areaY;
  const [finalA, finalB] = series.map((serie) => y(serie.valores.at(-1) ?? 0)) as [number, number];
  const sobreposicao = Math.max(0, DISTANCIA_MINIMA_DOS_ROTULOS - Math.abs(finalA - finalB)) / 2;
  const afastamento = finalA <= finalB ? -sobreposicao : sobreposicao;
  const alturasDosRotulos = [finalA + afastamento, finalB - afastamento];
  const intervaloDosRotulos = Math.max(1, Math.ceil(etapas / Math.max(areaX / 44, 1)));

  function apontar(evento: PointerEvent<SVGRectElement>) {
    const caixa = evento.currentTarget.getBoundingClientRect();
    const proporcao = (evento.clientX - caixa.left) / caixa.width;

    setAtiva(Math.min(etapas - 1, Math.max(0, Math.round(proporcao * (etapas - 1)))));
  }

  function navegar(evento: KeyboardEvent<HTMLDivElement>) {
    const passos: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1 };
    const passo = passos[evento.key];

    if (passo === undefined) {
      if (evento.key === 'Escape') setAtiva(null);
      return;
    }

    evento.preventDefault();
    setAtiva((atual) => Math.min(etapas - 1, Math.max(0, (atual ?? etapas) + passo)));
  }

  const dica =
    ativa === null
      ? null
      : {
          esquerda: x(ativa),
          titulo: `Etapa ${ativa + 1} · ${nomeDaEtapa(ativa + 1)}`,
          linhas: series.map((serie) => ({
            ...serie,
            total: serie.valores[ativa] ?? 0,
            ganho: (serie.valores[ativa] ?? 0) - (serie.valores[ativa - 1] ?? 0),
          })),
        };

  return (
    <div
      ref={ref}
      className={styles.grafico}
      tabIndex={0}
      role="group"
      aria-label="Pontos acumulados por etapa. Use as setas para percorrer as etapas."
      onKeyDown={navegar}
      onBlur={() => setAtiva(null)}
    >
      {largura > 0 && (
        <svg width={largura} height={ALTURA} aria-hidden="true">
          {marcas.map((marca) => (
            <g key={marca}>
              <line
                x1={MARGEM.esquerda}
                x2={MARGEM.esquerda + areaX}
                y1={y(marca)}
                y2={y(marca)}
                className={marca === 0 ? styles.base : styles.grade}
              />
              <text x={MARGEM.esquerda - 10} y={y(marca)} className={styles.rotuloY}>
                {marca}
              </text>
            </g>
          ))}

          {Array.from({ length: etapas }, (_, indice) =>
            indice % intervaloDosRotulos === 0 || indice === etapas - 1 ? (
              <text key={indice} x={x(indice)} y={ALTURA - 10} className={styles.rotuloX}>
                {indice + 1}
              </text>
            ) : null,
          )}

          {ativa !== null && (
            <line
              x1={x(ativa)}
              x2={x(ativa)}
              y1={MARGEM.topo}
              y2={MARGEM.topo + areaY}
              className={styles.guia}
            />
          )}

          {series.map((serie) => (
            <polyline
              key={serie.nome}
              points={serie.valores.map((valor, indice) => `${x(indice)},${y(valor)}`).join(' ')}
              className={styles.linha}
              style={{ stroke: serie.cor }}
            />
          ))}

          {series.map((serie, indice) => (
            <text
              key={serie.nome}
              x={x(etapas - 1) + 8}
              y={alturasDosRotulos[indice]}
              className={styles.rotuloFinal}
            >
              {serie.valores.at(-1) ?? 0}
            </text>
          ))}

          {ativa !== null &&
            series.map((serie) => (
              <circle
                key={serie.nome}
                cx={x(ativa)}
                cy={y(serie.valores[ativa] ?? 0)}
                r={5}
                className={styles.ponto}
                style={{ fill: serie.cor }}
              />
            ))}

          <rect
            x={MARGEM.esquerda}
            y={MARGEM.topo}
            width={areaX}
            height={areaY}
            className={styles.alvo}
            onPointerMove={apontar}
            onPointerLeave={() => setAtiva(null)}
          />
        </svg>
      )}

      {dica && (
        <div
          className={styles.dica}
          style={{ left: dica.esquerda }}
          data-lado={dica.esquerda > largura / 2 ? 'esquerda' : 'direita'}
          aria-live="polite"
        >
          <p className={styles.tituloDaDica}>{dica.titulo}</p>
          {dica.linhas.map((linha) => (
            <p key={linha.nome} className={styles.linhaDaDica}>
              <span className={styles.amostra} style={{ background: linha.cor }} />
              <span className={styles.nomeNaDica}>{linha.nome}</span>
              <span className={styles.valorNaDica}>
                {linha.total} pts
                {linha.ganho > 0 && <span className={styles.ganho}> +{linha.ganho}</span>}
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

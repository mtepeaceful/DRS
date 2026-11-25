/** O aro e a calota da roda. Sem nada, a roda é toda preta. */
export interface Aro {
  fundo?: string;
  raios?: string;
  /** Cores que dão a volta no aro, como o anel colorido da McLaren. */
  anel?: string[];
  larguraDoAnel?: number;
  borda?: string;
  centro?: string;
}

interface MarcaBase {
  x: number;
  y: number;
  giro?: number;
}

export type Marca =
  | (MarcaBase & {
      texto: string;
      tamanho: number;
      cor: string;
      peso?: number;
      espaco?: number;
      italico?: boolean;
      serifa?: boolean;
    })
  | (MarcaBase & { svg: string });

/**
 * A pintura de uma equipe por cima da carroceria comum. As partes em SVG
 * (`pinturaCorpo`, `pinturaPod`...) são recortadas no formato da peça.
 */
export interface Pintura {
  base: string;
  capacete: string;
  capaceteDetalhe?: string;
  aro: Aro;
  numero: { cor: string; contorno: string };
  tampa?: string;
  sidepod?: string;
  asaTraseira?: string;
  flap?: string;
  flap2?: string;
  endplate?: string;
  flapDianteiro?: string;
  retrovisor?: string;
  pinturaCorpo?: string;
  pinturaTampa?: string;
  pinturaPod?: string;
  marcas?: Marca[];
  /** Marcas da asa traseira, no desenho dela. */
  asa?: string;
  /** Marcas da asa dianteira. */
  frente?: string;
}

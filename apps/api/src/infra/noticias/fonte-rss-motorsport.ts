import { XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import type { FonteDeNoticias, Noticia } from '../../application/ports/fonte-de-noticias.js';
import { buscarTexto, FonteIndisponivel } from '../http-externo.js';

const FEED = 'https://br.motorsport.com/rss/f1/news/';
const FONTE = 'Motorsport.com Brasil';
const DOMINIOS_PERMITIDOS = ['motorsport.com', 'motorsport.uol.com.br'];

const leitor = new XMLParser({
  ignoreAttributes: true,
  processEntities: true,
  htmlEntities: true,
  parseTagValue: false,
  isArray: (nome) => nome === 'item',
});

const feed = z.object({
  rss: z.object({
    channel: z.object({
      item: z
        .array(z.object({ title: z.string(), link: z.string(), pubDate: z.string() }).partial())
        .default([]),
    }),
  }),
});

function linkSeguro(endereco: string | undefined) {
  if (!endereco) {
    return null;
  }

  try {
    const url = new URL(endereco.trim());
    const dominioConfere = DOMINIOS_PERMITIDOS.some(
      (dominio) => url.hostname === dominio || url.hostname.endsWith(`.${dominio}`),
    );

    for (const parametro of [...url.searchParams.keys()]) {
      if (parametro.startsWith('utm_')) {
        url.searchParams.delete(parametro);
      }
    }

    return url.protocol === 'https:' && dominioConfere ? url.toString() : null;
  } catch {
    return null;
  }
}

const ENTIDADES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function decodificarEntidades(texto: string) {
  return texto.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (original, codigo: string) => {
    if (codigo.startsWith('#')) {
      const numero = Number.parseInt(
        codigo.slice(codigo[1] === 'x' || codigo[1] === 'X' ? 2 : 1),
        codigo[1] === 'x' || codigo[1] === 'X' ? 16 : 10,
      );

      return numero > 0 && numero <= 0x10ffff ? String.fromCodePoint(numero) : original;
    }

    return ENTIDADES[codigo.toLowerCase()] ?? original;
  });
}

function textoLimpo(texto: string) {
  return decodificarEntidades(texto)
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export class FonteRssMotorsport implements FonteDeNoticias {
  async buscarNoticias(): Promise<Noticia[]> {
    const xml = await buscarTexto(FEED, 'application/rss+xml, application/xml');
    const lido = feed.safeParse(leitor.parse(xml));

    if (!lido.success) {
      throw new FonteIndisponivel(FEED, lido.error);
    }

    const noticias: Noticia[] = [];

    for (const item of lido.data.rss.channel.item) {
      const link = linkSeguro(item.link);
      const titulo = textoLimpo(item.title ?? '').slice(0, 200);
      const publicadaEm = new Date(item.pubDate ?? '');

      if (link && titulo && !Number.isNaN(publicadaEm.getTime())) {
        noticias.push({ titulo, link, fonte: FONTE, publicadaEm });
      }
    }

    return noticias;
  }
}

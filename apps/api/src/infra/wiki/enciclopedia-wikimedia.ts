import { z } from 'zod';
import type { Enciclopedia, Foto, Verbete } from '../../application/ports/fonte-das-equipes.js';
import { buscarJson, buscarJsonSeExistir } from '../http-externo.js';

const WIKIDATA = 'https://www.wikidata.org/w/api.php';
const FUNDADOR = 'P112';
const SEDE = 'P159';
const FUNDACAO = 'P571';
const INAUGURACAO = 'P1619';
const EMPRESA_MAE = 'P749';

const valor = z
  .object({ mainsnak: z.object({ datavalue: z.object({ value: z.unknown() }).optional() }) })
  .transform((afirmacao) => afirmacao.mainsnak.datavalue?.value);

const entidades = z.object({
  entities: z.record(
    z.string(),
    z.object({
      id: z.string().optional(),
      claims: z.record(z.string(), z.array(valor)).optional(),
      sitelinks: z.record(z.string(), z.object({ title: z.string() })).optional(),
      labels: z.record(z.string(), z.object({ value: z.string() })).optional(),
    }),
  ),
});

const referencia = z.object({ id: z.string().regex(/^Q\d+$/) });
const momento = z.object({ time: z.string().regex(/^[+-]\d{4,}/) });

const COMMONS = 'https://commons.wikimedia.org/w/api.php';
const SERVIDORES_DE_IMAGEM = new Set(['thumb.wikimedia.org', 'upload.wikimedia.org']);
const LARGURA_DA_FOTO = '500px';

const resumo = z.object({
  extract: z.string(),
  content_urls: z.object({ desktop: z.object({ page: z.url() }) }),
  thumbnail: z.object({ source: z.url() }).optional(),
});

const metadadosDoArquivo = z.object({
  query: z.object({
    pages: z.record(
      z.string(),
      z.object({
        imageinfo: z
          .array(
            z.object({
              extmetadata: z
                .object({
                  Artist: z.object({ value: z.string() }).optional(),
                  LicenseShortName: z.object({ value: z.string() }).optional(),
                })
                .optional(),
            }),
          )
          .optional(),
      }),
    ),
  }),
});

function arquivoDoCommons(endereco: string) {
  const url = new URL(endereco);

  if (url.protocol !== 'https:' || !SERVIDORES_DE_IMAGEM.has(url.hostname)) {
    return null;
  }

  const partes = url.pathname.split('/');

  if (partes[1] !== 'wikipedia' || partes[2] !== 'commons') {
    return null;
  }

  const miniatura = partes[3] === 'thumb';
  const arquivo = decodeURIComponent(partes[miniatura ? 6 : 5] ?? '');

  if (!arquivo) {
    return null;
  }

  url.search = '';

  if (miniatura) {
    partes[partes.length - 1] = (partes.at(-1) ?? '').replace(/^\d+px-/, `${LARGURA_DA_FOTO}-`);
    url.pathname = partes.join('/');
  }

  return { arquivo, url: url.href };
}

function semMarcacao(html: string) {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function fotoDoCommons(miniatura: string | undefined): Promise<Foto | null> {
  const encontrada = miniatura ? arquivoDoCommons(miniatura) : null;

  if (!encontrada) {
    return null;
  }

  const consulta = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'imageinfo',
    iiprop: 'extmetadata',
    titles: `File:${encontrada.arquivo}`,
  });
  const metadados = await buscarJson(`${COMMONS}?${consulta}`, metadadosDoArquivo).catch(
    () => null,
  );
  const [pagina] = Object.values(metadados?.query.pages ?? {});
  const extras = pagina?.imageinfo?.[0]?.extmetadata;
  const autor = extras?.Artist ? semMarcacao(extras.Artist.value) : '';

  return {
    url: encontrada.url,
    pagina: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(encontrada.arquivo.replaceAll(' ', '_'))}`,
    autor: autor || null,
    licenca: extras?.LicenseShortName?.value ?? null,
  };
}

type Entidade = z.infer<typeof entidades>['entities'][string];

function referencias(entidade: Entidade | undefined, propriedade: string) {
  return (entidade?.claims?.[propriedade] ?? []).flatMap((item) => {
    const lido = referencia.safeParse(item);

    return lido.success ? [lido.data.id] : [];
  });
}

function ano(entidade: Entidade | undefined) {
  const lido = momento.safeParse(
    entidade?.claims?.[FUNDACAO]?.[0] ?? entidade?.claims?.[INAUGURACAO]?.[0],
  );

  return lido.success ? Number.parseInt(lido.data.time.slice(1, 5), 10) : null;
}

async function buscarEntidades(parametros: Record<string, string>) {
  const consulta = new URLSearchParams({ action: 'wbgetentities', format: 'json', ...parametros });

  return (await buscarJson(`${WIKIDATA}?${consulta}`, entidades)).entities;
}

function resumoDaWikipedia(idioma: 'pt' | 'en', titulo: string) {
  const caminho = encodeURIComponent(titulo.replaceAll(' ', '_'));

  return buscarJsonSeExistir(
    `https://${idioma}.wikipedia.org/api/rest_v1/page/summary/${caminho}`,
    resumo,
  );
}

export class EnciclopediaWikimedia implements Enciclopedia {
  async verbete(artigoEmIngles: string): Promise<Verbete | null> {
    const [equipe] = Object.values(
      await buscarEntidades({ sites: 'enwiki', titles: artigoEmIngles, props: 'claims|sitelinks' }),
    );
    const [mae] = referencias(equipe, EMPRESA_MAE);
    const empresaMae = mae
      ? (await buscarEntidades({ ids: mae, props: 'claims' }))[mae]
      : undefined;
    const fundadores = referencias(equipe, FUNDADOR).length
      ? referencias(equipe, FUNDADOR)
      : referencias(empresaMae, FUNDADOR);
    const [sede] = referencias(equipe, SEDE).length
      ? referencias(equipe, SEDE)
      : referencias(empresaMae, SEDE);
    const nomes = await this.nomes([...fundadores, ...(sede ? [sede] : [])]);
    const tituloEmPortugues = equipe?.sitelinks?.ptwiki?.title;
    const texto =
      (tituloEmPortugues && (await resumoDaWikipedia('pt', tituloEmPortugues))) ||
      (await resumoDaWikipedia('en', artigoEmIngles));

    if (!texto) {
      return null;
    }

    return {
      resumo: texto.extract,
      fonte: texto.content_urls.desktop.page,
      foto: await fotoDoCommons(texto.thumbnail?.source),
      fundacao: ano(equipe),
      fundadores: fundadores.flatMap((id) => nomes.get(id) ?? []),
      sede: (sede && nomes.get(sede)) ?? null,
    };
  }

  private async nomes(ids: string[]) {
    if (ids.length === 0) {
      return new Map<string, string>();
    }

    const encontradas = await buscarEntidades({
      ids: ids.join('|'),
      props: 'labels',
      languages: 'pt|en',
    });

    return new Map(
      Object.entries(encontradas).flatMap(([id, entidade]) => {
        const rotulo = entidade.labels?.pt?.value ?? entidade.labels?.en?.value;

        return rotulo ? [[id, rotulo] as const] : [];
      }),
    );
  }
}

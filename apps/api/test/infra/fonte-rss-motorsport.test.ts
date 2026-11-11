import { afterEach, describe, expect, it, vi } from 'vitest';
import { FonteIndisponivel } from '../../src/infra/http-externo.js';
import { FonteRssMotorsport } from '../../src/infra/noticias/fonte-rss-motorsport.js';

function item(titulo: string, link: string, data = 'Wed, 11 Nov 2026 17:32:00 +0000') {
  return `<item><title><![CDATA[${titulo}]]></title><link>${link}</link><pubDate>${data}</pubDate></item>`;
}

function responderXml(xml: string) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(xml, { status: 200 }));
}

afterEach(() => vi.restoreAllMocks());

describe('FonteRssMotorsport', () => {
  it('lê título, link e data, removendo parâmetros de rastreamento', async () => {
    responderXml(
      `<rss><channel>${item(
        'Norris vence &amp; lidera',
        'https://motorsport.uol.com.br/f1/news/norris/123/?utm_source=RSS&amp;id=1',
      )}</channel></rss>`,
    );

    const [noticia] = await new FonteRssMotorsport().buscarNoticias();

    expect(noticia).toEqual({
      titulo: 'Norris vence & lidera',
      link: 'https://motorsport.uol.com.br/f1/news/norris/123/?id=1',
      fonte: 'Motorsport.com Brasil',
      publicadaEm: new Date('2026-11-11T17:32:00Z'),
    });
  });

  it('descarta links fora dos domínios permitidos ou sem https', async () => {
    responderXml(
      `<rss><channel>${[
        item('Golpe', 'https://site-malicioso.com/noticia'),
        item('Imitação', 'https://motorsport.uol.com.br.site-malicioso.com/x'),
        item('Script', 'javascript:alert(1)'),
        item('Sem https', 'http://motorsport.uol.com.br/f1/news/x'),
        item('Válida', 'https://br.motorsport.com/f1/news/valida'),
      ].join('')}</channel></rss>`,
    );

    const noticias = await new FonteRssMotorsport().buscarNoticias();

    expect(noticias.map((n) => n.titulo)).toEqual(['Válida']);
  });

  it('remove tags HTML do título', async () => {
    responderXml(
      `<rss><channel>${item('<b>Título</b> <img src=x onerror=alert(1)>limpo', 'https://br.motorsport.com/a')}</channel></rss>`,
    );

    const [noticia] = await new FonteRssMotorsport().buscarNoticias();

    expect(noticia?.titulo).toBe('Título limpo');
  });

  it('falha de forma controlada com um documento que não é RSS', async () => {
    responderXml('<html><body>manutenção</body></html>');

    await expect(new FonteRssMotorsport().buscarNoticias()).rejects.toThrow(FonteIndisponivel);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { comCache, comCachePorChave } from '../../src/infra/cache/com-cache.js';

describe('comCache', () => {
  it('reaproveita o valor enquanto ele é válido', async () => {
    let agora = 0;
    const buscar = vi.fn(async () => agora);
    const emCache = comCache(buscar, 1000, () => agora);

    await emCache();
    agora = 999;

    await expect(emCache()).resolves.toBe(0);
    expect(buscar).toHaveBeenCalledTimes(1);
  });

  it('busca de novo depois de expirar', async () => {
    let agora = 0;
    const emCache = comCache(
      async () => agora,
      1000,
      () => agora,
    );

    await emCache();
    agora = 1000;

    await expect(emCache()).resolves.toBe(1000);
  });

  it('devolve o último valor bom quando a fonte falha', async () => {
    let agora = 0;
    const buscar = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('dados')
      .mockRejectedValue(new Error('fora do ar'));
    const emCache = comCache(buscar, 1000, () => agora);

    await emCache();
    agora = 5000;

    await expect(emCache()).resolves.toBe('dados');
  });

  it('repassa o erro quando ainda não há valor guardado', async () => {
    const emCache = comCache(() => Promise.reject(new Error('fora do ar')), 1000);

    await expect(emCache()).rejects.toThrow('fora do ar');
  });

  it('faz uma única busca para chamadas simultâneas', async () => {
    const buscar = vi.fn(async () => 'dados');
    const emCache = comCache(buscar, 1000);

    await Promise.all([emCache(), emCache(), emCache()]);

    expect(buscar).toHaveBeenCalledTimes(1);
  });
});

describe('comCachePorChave', () => {
  it('guarda um valor separado para cada chave', async () => {
    const buscar = vi.fn(async (rodada: number) => `rodada ${rodada}`);
    const emCache = comCachePorChave(buscar, 1000);

    await expect(emCache(1)).resolves.toBe('rodada 1');
    await expect(emCache(2)).resolves.toBe('rodada 2');
    await emCache(1);

    expect(buscar).toHaveBeenCalledTimes(2);
  });
});

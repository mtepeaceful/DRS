interface Entrada<Valor> {
  valor: Valor;
  expiraEm: number;
}

export function comCache<Valor>(
  buscar: () => Promise<Valor>,
  validadeEmMs: number,
  agora: () => number = Date.now,
) {
  let guardado: Entrada<Valor> | null = null;
  let emAndamento: Promise<Valor> | null = null;

  return async (): Promise<Valor> => {
    if (guardado && guardado.expiraEm > agora()) {
      return guardado.valor;
    }

    emAndamento ??= buscar()
      .then((valor) => {
        guardado = { valor, expiraEm: agora() + validadeEmMs };

        return valor;
      })
      .finally(() => {
        emAndamento = null;
      });

    try {
      return await emAndamento;
    } catch (erro) {
      if (guardado) {
        return guardado.valor;
      }

      throw erro;
    }
  };
}

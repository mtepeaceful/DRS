export type CodigoDeErro =
  | 'PILOTO_NAO_ENCONTRADO'
  | 'EQUIPE_NAO_ENCONTRADA'
  | 'EQUIPE_INVALIDA'
  | 'NUMERO_JA_EM_USO'
  | 'EQUIPE_JA_EXISTE'
  | 'ETAPA_NAO_ENCONTRADA';

export abstract class ErroDeDominio extends Error {
  abstract readonly codigo: CodigoDeErro;

  constructor(mensagem: string) {
    super(mensagem);
    this.name = new.target.name;
  }
}

export class PilotoNaoEncontrado extends ErroDeDominio {
  readonly codigo = 'PILOTO_NAO_ENCONTRADO';

  constructor() {
    super('Piloto não encontrado.');
  }
}

export class EquipeNaoEncontrada extends ErroDeDominio {
  readonly codigo = 'EQUIPE_NAO_ENCONTRADA';

  constructor() {
    super('Equipe não encontrada.');
  }
}

export class EquipeInvalida extends ErroDeDominio {
  readonly codigo = 'EQUIPE_INVALIDA';

  constructor() {
    super('A equipe informada não existe.');
  }
}

export class NumeroJaEmUso extends ErroDeDominio {
  readonly codigo = 'NUMERO_JA_EM_USO';

  constructor(numero: number) {
    super(`O número ${numero} já pertence a outro piloto.`);
  }
}

export class EquipeJaExiste extends ErroDeDominio {
  readonly codigo = 'EQUIPE_JA_EXISTE';

  constructor(nome: string) {
    super(`Já existe uma equipe chamada ${nome}.`);
  }
}

export class EtapaNaoEncontrada extends ErroDeDominio {
  readonly codigo = 'ETAPA_NAO_ENCONTRADA';

  constructor() {
    super('Etapa não encontrada no calendário da temporada.');
  }
}

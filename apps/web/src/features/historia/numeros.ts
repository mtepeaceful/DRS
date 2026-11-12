const formato = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

export function pontos(valor: number) {
  return formato.format(valor);
}

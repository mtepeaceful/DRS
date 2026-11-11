const arquivos = import.meta.glob<string>('/node_modules/country-flag-icons/3x2/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
});

const nomes = new Intl.DisplayNames('pt-BR', { type: 'region', fallback: 'none' });
const bandeiras = new Map<string, string>();

for (const [caminho, url] of Object.entries(arquivos)) {
  const codigo = caminho.slice(caminho.lastIndexOf('/') + 1, -'.svg'.length);

  if (/^[A-Z]{2}$/.test(codigo)) {
    bandeiras.set(codigo, url);
  }
}

export function bandeiraDoPais(codigo: string) {
  return bandeiras.get(codigo);
}

export function nomeDoPais(codigo: string) {
  try {
    return nomes.of(codigo) ?? codigo;
  } catch {
    return codigo;
  }
}

export const paises = [...bandeiras.keys()]
  .map((codigo) => ({ codigo, nome: nomeDoPais(codigo) }))
  .filter((pais) => pais.nome !== pais.codigo)
  .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

export interface Pagina<Item> {
  itens: Item[];
  total: number;
  pagina: number;
  porPagina: number;
}

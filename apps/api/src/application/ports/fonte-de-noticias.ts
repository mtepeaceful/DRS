export interface Noticia {
  titulo: string;
  link: string;
  fonte: string;
  publicadaEm: Date;
}

export interface FonteDeNoticias {
  buscarNoticias(): Promise<Noticia[]>;
}

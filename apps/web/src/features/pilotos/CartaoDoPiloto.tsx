import type { EquipeDTO, FotoDTO } from '@drs/contracts';
import { useState } from 'react';
import { Link } from 'react-router';
import { estiloDaEquipe } from '../../shared/lib/equipe';
import { nomeDoPais } from '../../shared/lib/paises';
import { Bandeira } from '../../shared/ui/Bandeira';
import { SimboloDaEquipe } from '../equipes/SimboloDaEquipe';
import styles from './CartaoDoPiloto.module.css';
import { rotuloDeTitulos } from './titulos';
import { useTextos } from '../../shared/i18n/idioma';

const TEXTOS = {
  pt: {
    foto: 'Foto',
    semEquipe: 'Sem equipe',
    nome: 'Nome do piloto',
    numero: 'número',
    pais: 'País',
  },
  en: {
    foto: 'Photo',
    semEquipe: 'No team',
    nome: 'Driver name',
    numero: 'number',
    pais: 'Country',
  },
};

interface Props {
  nome: string;
  numero: number | undefined;
  pais: string;
  titulos: number;
  equipe: EquipeDTO | undefined;
  para?: string;
  foto?: FotoDTO | undefined;
}

export function CartaoDoPiloto({ nome, numero, pais, titulos, equipe, para, foto }: Props) {
  const numeroValido = numero !== undefined && Number.isInteger(numero);
  const [quebrada, setQuebrada] = useState<string | null>(null);
  const t = useTextos(TEXTOS);

  return (
    <article className={styles.cartao} style={estiloDaEquipe(equipe)}>
      <span className={styles.numero} aria-hidden="true">
        {numeroValido ? numero : '–'}
      </span>

      {foto && quebrada === foto.url && (
        <span className={styles.semRetrato} aria-hidden="true">
          {numeroValido ? numero : '–'}
        </span>
      )}

      {foto && quebrada !== foto.url && (
        <img
          src={foto.url}
          alt=""
          title={[t.foto, foto.autor, foto.licenca].filter(Boolean).join(' · ')}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setQuebrada(foto.url)}
          className={styles.retrato}
        />
      )}

      <div className={styles.corpo}>
        <p className={styles.equipe}>
          {equipe && <SimboloDaEquipe {...equipe} />}
          {equipe?.nome ?? t.semEquipe}
        </p>
        <h2 className={styles.nome}>
          {para ? (
            <Link to={para} className={styles.link} viewTransition>
              {nome || t.nome}
              {numeroValido && (
                <span className="apenas-leitor">
                  , {t.numero} {numero}
                </span>
              )}
            </Link>
          ) : (
            nome || t.nome
          )}
        </h2>
      </div>

      <div className={styles.rodape}>
        <span className={styles.pais}>
          <Bandeira pais={pais} />
          {pais ? nomeDoPais(pais) : t.pais}
        </span>
        {titulos > 0 && <span className={styles.campeao}>{rotuloDeTitulos(titulos)}</span>}
      </div>
    </article>
  );
}

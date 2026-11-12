import type { RouteObject } from 'react-router';
import { CalendarioPage } from '../features/calendario/CalendarioPage';
import { ResultadoPage } from '../features/calendario/ResultadoPage';
import { ComparacaoPage } from '../features/comparar/ComparacaoPage';
import { EquipesPage } from '../features/equipes/EquipesPage';
import { HistoriaPage } from '../features/historia/HistoriaPage';
import { TemporadaHistoricaPage } from '../features/historia/TemporadaHistoricaPage';
import { HomePage } from '../features/home/HomePage';
import { PilotoDetalhesPage } from '../features/pilotos/PilotoDetalhesPage';
import { PilotoFormPage } from '../features/pilotos/PilotoFormPage';
import { PilotosPage } from '../features/pilotos/PilotosPage';
import { ApenasAdministrador } from '../features/sessao/ApenasAdministrador';
import { EntrarPage } from '../features/sessao/EntrarPage';
import { Layout } from '../shared/ui/Layout';
import { NaoEncontrada } from '../shared/ui/NaoEncontrada';

export const rotas: RouteObject[] = [
  {
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: 'calendario', Component: CalendarioPage },
      { path: 'calendario/:rodada', Component: ResultadoPage },
      { path: 'comparar', Component: ComparacaoPage },
      { path: 'pilotos', Component: PilotosPage },
      { path: 'pilotos/:id', Component: PilotoDetalhesPage },
      { path: 'entrar', Component: EntrarPage },
      {
        Component: ApenasAdministrador,
        children: [
          { path: 'pilotos/novo', Component: PilotoFormPage },
          { path: 'pilotos/:id/editar', Component: PilotoFormPage },
        ],
      },
      { path: 'equipes', Component: EquipesPage },
      { path: 'historia', Component: HistoriaPage },
      { path: 'historia/:ano', Component: TemporadaHistoricaPage },
      { path: '*', Component: NaoEncontrada },
    ],
  },
];

import type { RouteObject } from 'react-router';
import { CalendarioPage } from '../features/calendario/CalendarioPage';
import { ResultadoPage } from '../features/calendario/ResultadoPage';
import { EquipesPage } from '../features/equipes/EquipesPage';
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
      { path: '*', Component: NaoEncontrada },
    ],
  },
];

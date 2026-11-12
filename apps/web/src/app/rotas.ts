import type { RouteObject } from 'react-router';
import { HomePage } from '../features/home/HomePage';
import { ApenasAdministrador } from '../features/sessao/ApenasAdministrador';
import { CarregandoPagina } from '../shared/ui/CarregandoPagina';
import { Layout } from '../shared/ui/Layout';
import { NaoEncontrada } from '../shared/ui/NaoEncontrada';

export const rotas: RouteObject[] = [
  {
    Component: Layout,
    HydrateFallback: CarregandoPagina,
    children: [
      { index: true, Component: HomePage },
      {
        path: 'calendario',
        lazy: () =>
          import('../features/calendario/CalendarioPage').then((m) => ({
            Component: m.CalendarioPage,
          })),
      },
      {
        path: 'calendario/:rodada',
        lazy: () =>
          import('../features/calendario/ResultadoPage').then((m) => ({
            Component: m.ResultadoPage,
          })),
      },
      {
        path: 'classificacao',
        lazy: () =>
          import('../features/campeonato/ClassificacaoPage').then((m) => ({
            Component: m.ClassificacaoPage,
          })),
      },
      {
        path: 'comparar',
        lazy: () =>
          import('../features/comparar/ComparacaoPage').then((m) => ({
            Component: m.ComparacaoPage,
          })),
      },
      {
        path: 'pilotos',
        lazy: () =>
          import('../features/pilotos/PilotosPage').then((m) => ({ Component: m.PilotosPage })),
      },
      {
        path: 'pilotos/:id',
        lazy: () =>
          import('../features/pilotos/PilotoDetalhesPage').then((m) => ({
            Component: m.PilotoDetalhesPage,
          })),
      },
      {
        path: 'pilotos/:id/garagem',
        lazy: () =>
          import('../features/garagem/GaragemPage').then((m) => ({ Component: m.GaragemPage })),
      },
      {
        path: 'entrar',
        lazy: () =>
          import('../features/sessao/EntrarPage').then((m) => ({ Component: m.EntrarPage })),
      },
      {
        Component: ApenasAdministrador,
        children: [
          {
            path: 'pilotos/novo',
            lazy: () =>
              import('../features/pilotos/PilotoFormPage').then((m) => ({
                Component: m.PilotoFormPage,
              })),
          },
          {
            path: 'equipes/gerenciar',
            lazy: () =>
              import('../features/equipes/GerenciarEquipesPage').then((m) => ({
                Component: m.GerenciarEquipesPage,
              })),
          },
          {
            path: 'pilotos/:id/editar',
            lazy: () =>
              import('../features/pilotos/PilotoFormPage').then((m) => ({
                Component: m.PilotoFormPage,
              })),
          },
        ],
      },
      {
        path: 'equipes',
        lazy: () =>
          import('../features/dicionario/EquipesPage').then((m) => ({ Component: m.EquipesPage })),
      },
      {
        path: 'equipes/:id',
        lazy: () =>
          import('../features/dicionario/FichaDaEquipePage').then((m) => ({
            Component: m.FichaDaEquipePage,
          })),
      },
      {
        path: 'historia',
        lazy: () =>
          import('../features/historia/HistoriaPage').then((m) => ({
            Component: m.HistoriaPage,
          })),
      },
      {
        path: 'historia/:ano',
        lazy: () =>
          import('../features/historia/TemporadaHistoricaPage').then((m) => ({
            Component: m.TemporadaHistoricaPage,
          })),
      },
      { path: '*', Component: NaoEncontrada },
    ],
  },
];

import { z } from 'zod';

export function usarMensagensEmPortugues() {
  z.config(z.locales.ptBR());
}

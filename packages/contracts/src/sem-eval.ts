import { z } from 'zod';

// No navegador, o zod testa se pode usar Function() para acelerar a validação.
// A CSP do site (script-src 'self') barra o teste e registra uma violação em
// toda página. Este módulo é o primeiro do pacote para valer antes de qualquer
// esquema ser criado. A API, no servidor, continua com a validação acelerada.
if (typeof window !== 'undefined') {
  z.config({ jitless: true });
}

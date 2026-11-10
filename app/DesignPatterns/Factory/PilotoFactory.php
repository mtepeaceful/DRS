<?php

namespace App\DesignPatterns\Factory;

class PilotoFactory
{
    public static function getPiloto($nome)
    {
        if (empty($nome)) {
            return null;
        }

        $busca = trim($nome);

        // Busca o piloto no banco de dados usando o Model Eloquent
        $pilotoDb = \App\Models\Piloto::where('nome', 'like', '%' . $busca . '%')->first();

        if (!$pilotoDb) {
            return null;
        }

        return new Piloto(
            $pilotoDb->nome,
            $pilotoDb->equipe,
            $pilotoDb->nacionalidade,
            (int) $pilotoDb->numero,
            (int) ($pilotoDb->titulos ?? 0)
        );
    }
}

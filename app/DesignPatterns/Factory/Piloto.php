<?php

namespace App\DesignPatterns\Factory;

class Piloto
{
    public $nomeCompleto;
    public $equipe;
    public $nacionalidade;
    public $numero;
    public $titulosMundiais;

    public function __construct(string $nomeCompleto, string $equipe, string $nacionalidade, int $numero, int $titulosMundiais)
    {
        $this->nomeCompleto = $nomeCompleto;
        $this->equipe = $equipe;
        $this->nacionalidade = $nacionalidade;
        $this->numero = $numero;
        $this->titulosMundiais = $titulosMundiais;
    }
}

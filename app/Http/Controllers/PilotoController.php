<?php

namespace App\Http\Controllers;

use App\Http\Requests\PilotoRequest;
use App\Models\Piloto;
use Illuminate\Http\Request;

class PilotoController extends Controller
{
    public function index(Request $request)
    {
        $busca = $request->input('busca');
        $pilotos = Piloto::when($busca, function ($query, $busca) {
            return $query->where('nome', 'like', '%' . $busca . '%')
                         ->orWhere('equipe', 'like', '%' . $busca . '%');
        })->paginate(5);

        return view('pilotos.index', compact('pilotos', 'busca'));
    }

    public function create()
    {
        return view('pilotos.create');
    }

    public function store(PilotoRequest $request)
    {
        Piloto::create($request->validated());

        return redirect()->route('pilotos.index')->with('sucesso', 'Piloto cadastrado com sucesso!');
    }

    public function show(Piloto $piloto)
    {
        return view('pilotos.show', compact('piloto'));
    }

    public function edit(Piloto $piloto)
    {
        return view('pilotos.edit', compact('piloto'));
    }

    public function update(PilotoRequest $request, Piloto $piloto)
    {
        $piloto->update($request->validated());

        return redirect()->route('pilotos.index')->with('sucesso', 'Piloto atualizado com sucesso!');
    }

    public function destroy(Piloto $piloto)
    {
        $piloto->delete();

        return redirect()->route('pilotos.index')->with('sucesso', 'Piloto excluído com sucesso!');
    }
}

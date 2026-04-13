<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Piloto;
use Illuminate\Http\Request;

class PilotoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $busca = $request->input('busca');
        $pilotos = Piloto::when($busca, function ($query, $busca) {
            return $query->where('nome', 'like', '%' . $busca . '%')
                         ->orWhere('equipe', 'like', '%' . $busca . '%');
        })->paginate(5);

        return view('pilotos.index', compact('pilotos', 'busca'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('pilotos.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'numero' => ['required', 'integer'],
            'nacionalidade' => ['required', 'string', 'max:100'],
            'equipe' => ['required', 'string', 'max:100'],
            'titulos' => ['nullable', 'integer'],
        ]);

        Piloto::create($request->all());

        return redirect()->route('pilotos.index')->with('sucesso', 'Piloto cadastrado com sucesso!');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $piloto = Piloto::findOrFail($id);
        return view('pilotos.show', compact('piloto'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $piloto = Piloto::findOrFail($id);
        return view('pilotos.edit', compact('piloto'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'numero' => ['required', 'integer'],
            'nacionalidade' => ['required', 'string', 'max:100'],
            'equipe' => ['required', 'string', 'max:100'],
            'titulos' => ['nullable', 'integer'],
        ]);

        $piloto = Piloto::findOrFail($id);
        $piloto->update($request->all());

        return redirect()->route('pilotos.index')->with('sucesso', 'Piloto atualizado com sucesso!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $piloto = Piloto::findOrFail($id);
        $piloto->delete();

        return redirect()->route('pilotos.index')->with('sucesso', 'Piloto excluído com sucesso!');
    }
}

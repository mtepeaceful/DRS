<div class="mb-3">
    <label for="nome" class="form-label">Nome Completo</label>
    <input type="text" id="nome" name="nome" class="form-control @error('nome') is-invalid @enderror"
        value="{{ old('nome', $piloto?->nome) }}" placeholder="Ex: Lewis Hamilton" maxlength="255" required>
    @error('nome')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="row">
    <div class="col-md-6 mb-3">
        <label for="equipe" class="form-label">Equipe</label>
        <input type="text" id="equipe" name="equipe" class="form-control @error('equipe') is-invalid @enderror"
            value="{{ old('equipe', $piloto?->equipe) }}" placeholder="Ex: Mercedes" maxlength="100" required>
        @error('equipe')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
    <div class="col-md-6 mb-3">
        <label for="nacionalidade" class="form-label">Nacionalidade</label>
        <input type="text" id="nacionalidade" name="nacionalidade" class="form-control @error('nacionalidade') is-invalid @enderror"
            value="{{ old('nacionalidade', $piloto?->nacionalidade) }}" placeholder="Ex: Britânico" maxlength="100" required>
        @error('nacionalidade')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
</div>

<div class="row">
    <div class="col-md-6 mb-3">
        <label for="numero" class="form-label">Número</label>
        <input type="number" id="numero" name="numero" class="form-control @error('numero') is-invalid @enderror"
            value="{{ old('numero', $piloto?->numero) }}" placeholder="44" min="0" max="99" required>
        @error('numero')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
    <div class="col-md-6 mb-4">
        <label for="titulos" class="form-label">Títulos Mundiais</label>
        <input type="number" id="titulos" name="titulos" class="form-control @error('titulos') is-invalid @enderror"
            value="{{ old('titulos', $piloto?->titulos ?? 0) }}" min="0">
        @error('titulos')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
</div>

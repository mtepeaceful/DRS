<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PilotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['titulos' => $this->input('titulos') ?? 0]);
    }

    public function rules(): array
    {
        return [
            'nome' => ['required', 'string', 'max:255'],
            'numero' => ['required', 'integer', 'between:0,99'],
            'nacionalidade' => ['required', 'string', 'max:100'],
            'equipe' => ['required', 'string', 'max:100'],
            'titulos' => ['required', 'integer', 'min:0'],
        ];
    }
}

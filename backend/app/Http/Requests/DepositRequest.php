<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validasi setoran ke target tabungan (PRD §11).
 *
 * Pemeriksaan saldo dan sisa target dilakukan di controller di dalam
 * transaksi database karena bergantung pada data terkini.
 */
class DepositRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999999.99'],
            'note' => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['nullable', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'amount.required' => 'Nominal wajib diisi.',
            'amount.numeric' => 'Nominal harus berupa angka.',
            'amount.gt' => 'Nominal harus lebih besar dari 0.',
            'amount.max' => 'Nominal melebihi batas yang diizinkan.',
            'note.max' => 'Catatan maksimal 255 karakter.',
            'transaction_date.date' => 'Format tanggal tidak valid.',
        ];
    }
}

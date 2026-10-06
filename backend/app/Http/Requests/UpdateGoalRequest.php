<?php

namespace App\Http\Requests;

use App\Models\SavingGoal;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validasi perubahan target tabungan (PRD §35).
 *
 * Nominal terkumpul tidak dapat diubah lewat endpoint ini; perubahan datang
 * dari setoran, edit, dan hapus transaksi tabungan.
 */
class UpdateGoalRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'target_amount' => ['sometimes', 'required', 'numeric', 'gt:0', 'max:9999999999999.99'],
            'deadline' => ['nullable', 'date'],
            'status' => ['sometimes', 'string', Rule::in(SavingGoal::STATUSES)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama target wajib diisi.',
            'name.max' => 'Nama target maksimal 100 karakter.',
            'target_amount.required' => 'Nominal target wajib diisi.',
            'target_amount.numeric' => 'Nominal target harus berupa angka.',
            'target_amount.gt' => 'Nominal target harus lebih besar dari 0.',
            'target_amount.max' => 'Nominal target melebihi batas yang diizinkan.',
            'deadline.date' => 'Format tanggal tidak valid.',
            'status.in' => 'Status target tidak valid.',
        ];
    }
}

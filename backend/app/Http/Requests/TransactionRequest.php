<?php

namespace App\Http\Requests;

use App\Models\Transaction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validasi pembuatan dan perubahan transaksi (PRD §35).
 *
 * Setoran tabungan tidak diterima di sini; setoran dibuat melalui
 * endpoint deposit pada target tabungan.
 */
class TransactionRequest extends FormRequest
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
            'type' => ['required', 'string', Rule::in(Transaction::TYPES)],
            'category' => ['required', 'string', 'max:50', Rule::in($this->allowedCategories())],
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999999.99'],
            'note' => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'type.required' => 'Jenis transaksi wajib diisi.',
            'type.in' => 'Jenis transaksi tidak valid.',
            'category.required' => 'Kategori wajib diisi.',
            'category.in' => 'Kategori tidak valid untuk jenis transaksi ini.',
            'category.max' => 'Kategori maksimal 50 karakter.',
            'amount.required' => 'Nominal wajib diisi.',
            'amount.numeric' => 'Nominal harus berupa angka.',
            'amount.gt' => 'Nominal harus lebih besar dari 0.',
            'amount.max' => 'Nominal melebihi batas yang diizinkan.',
            'note.max' => 'Catatan maksimal 255 karakter.',
            'transaction_date.required' => 'Tanggal wajib diisi.',
            'transaction_date.date' => 'Format tanggal tidak valid.',
        ];
    }

    /**
     * Daftar kategori mengikuti jenis transaksi (PRD §14).
     *
     * @return list<string>
     */
    private function allowedCategories(): array
    {
        return match ($this->input('type')) {
            Transaction::TYPE_INCOME => array_values((array) config('categories.income')),
            Transaction::TYPE_EXPENSE => array_values((array) config('categories.expense')),
            Transaction::TYPE_SAVING => [Transaction::CATEGORY_SAVING],
            default => [],
        };
    }
}

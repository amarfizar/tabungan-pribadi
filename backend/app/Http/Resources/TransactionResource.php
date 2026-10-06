<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'category' => $this->category,
            'amount' => $this->amount,
            'note' => $this->note,
            'transaction_date' => $this->transaction_date?->format('Y-m-d'),
            'saving_goal' => $this->savingGoal === null
                ? null
                : ['id' => $this->savingGoal->id, 'name' => $this->savingGoal->name],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['income', 'expense', 'saving']);
            $table->string('category', 50);
            $table->decimal('amount', 15, 2);
            $table->string('note', 255)->nullable();
            $table->date('transaction_date');
            $table->foreignId('saving_goal_id')->nullable()->constrained('saving_goals')->cascadeOnDelete();
            $table->timestamps();

            // Index komposit untuk riwayat dan statistik per periode.
            $table->index(['user_id', 'transaction_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

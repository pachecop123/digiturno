<template>
<div class="container py-4">
<h1>Tomar Turno - Carnicería</h1>


<div class="card p-4 my-3">
<p>Último turno: <strong>{{ lastIssued }}</strong></p>
<button class="btn btn-primary btn-lg" @click="takeTicket">Tomar turno</button>
</div>


<div v-if="ticket" class="mt-3">
<h3>Tu turno: <span class="badge bg-success fs-3">{{ ticket }}</span></h3>
</div>
</div>
</template>


<script setup>
import store from '../store'
import Swal from 'sweetalert2'
import { computed, ref } from 'vue'


const ticket = ref(null)


const lastIssued = computed(() => {
const n = store.state.lastIssued
return n === 0 ? '—' : `${store.state.prefix}-${String(n).padStart(3, '0')}`
})


function takeTicket() {
const t = store.issueTicket()
ticket.value = t
Swal.fire({
title: 'Turno generado',
text: `Tu turno es ${t}`,
icon: 'success',
confirmButtonText: 'OK'
})
}
</script>
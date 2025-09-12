<template>
<div class="container p-4">
<h1>Panel de administración</h1>


<div class="d-flex gap-2 my-3">
<button class="btn btn-success" @click="callNext">Llamar siguiente</button>
<button class="btn btn-danger" @click="resetAll">Reiniciar cola</button>
</div>


<div v-if="queue.length">
<h5>En espera:</h5>
<ul class="list-group">
<li class="list-group-item" v-for="q in queue" :key="q">{{ q }}</li>
</ul>
</div>


<div class="mt-3" v-if="current">
<h3>En atención: <span class="badge bg-primary fs-3">{{ current }}</span></h3>
</div>
</div>
</template>


<script setup>
import store from '../store'
import Swal from 'sweetalert2'
import { computed } from 'vue'


const queue = computed(() => store.state.queue)
const current = computed(() => store.state.current)


function callNext() {
const next = store.callNext()
if (!next) {
Swal.fire('Sin turnos', 'La cola está vacía', 'info')
return
}
// notificación simple
Swal.fire('Llamando', `Turno ${next}`, 'info')
}


function resetAll() {
Swal.fire({
title: 'Reiniciar cola?',
text: 'Se borrarán todos los turnos',
icon: 'warning',
showCancelButton: true
}).then((res) => {
if (res.isConfirmed) {
store.resetQueue()
Swal.fire('Reiniciado', '', 'success')
}
})
}
</script>
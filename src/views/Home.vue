<template>
<div class="container py-4">
<h1>Digiturno - Carnicería</h1>
<p>Usa los enlaces para abrir el kiosco (clientes), la pantalla (monitor) y el panel de administración.</p>
<div class="d-flex gap-2">
<router-link class="btn btn-primary" to="/kiosk">Abrir kiosco</router-link>
<router-link class="btn btn-secondary" to="/display">Abrir pantalla</router-link>
<router-link class="btn btn-success" to="/admin">Ir a administración</router-link>
</div>
</div>
</template>
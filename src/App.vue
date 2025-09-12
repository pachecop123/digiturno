<template>
<nav class="navbar navbar-expand bg-light p-2">
<div class="container">
<router-link class="navbar-brand" to="/">Digiturno Diego Exito</router-link>
<div>
<router-link class="btn btn-outline-primary me-2" to="/kiosk">Kiosco</router-link>
<router-link class="btn btn-outline-secondary me-2" to="/display">Pantalla</router-link>
<router-link class="btn btn-outline-success" to="/admin">Admin</router-link>
</div>
</div>
</nav>


<router-view />
</template>
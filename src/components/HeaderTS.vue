<script setup>
import { useRouter } from 'vue-router'
// Inicializa o roteador do Vue
const router = useRouter()

</script>

<template>
    <nav class="navbar">
        <div class="nav-logo">
            <img src="../assets/Logo_2025_AZD_300px.png" alt="AZD" width="100px">
        </div>
        <div >
            <ul class="nav-links">
                <router-link class="nav-links-item" to="/">TimeSheet</router-link>
                <router-link class="nav-links-item" to="/graficos">Graficos</router-link>
                <!-- <router-link class="nav-links-item" to="admin">Admin</router-link> -->
            </ul>
        </div>
    </nav>
</template>
<style>
.navbar{
    position: fixed;
    color: #ffffff;
    background-color: #232323;
    top: 0%;
    left: 0%;
    width: 100%;
    padding: 5px 10px;
    /* z-index: 1000; */
    display: flex;
    justify-content: space-between;
}

.nav-links{
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
}
.nav-links-item{
    margin-right: 15px;
}
</style>
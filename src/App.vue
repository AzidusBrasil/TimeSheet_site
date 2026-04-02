<script setup>
import { ref } from 'vue';

import LoginModal from './components/LoginModal.vue';
import HeaderTS from './components/HeaderTS.vue';
// import TimeSheet from './views/TimeSheet.vue';

const mostrarLogin = ref(true);
const usuarioLogado = ref(null);

const logadoComSucesso = (user) => {
  usuarioLogado.value = user;
  alert(`Bem-vindo, ${user.Email}`);
};
</script>

<template>
  <div>
    <LoginModal 
      v-model="mostrarLogin" 
      @login-sucesso="logadoComSucesso" 
    />
  </div>

  <nav>
    <HeaderTS />
  </nav>
  <main>
    <router-view />
  </main>
</template>

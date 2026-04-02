<script setup>
import { ref } from 'vue';

// Define o que o modal recebe e o que ele avisa ao pai
const props = defineProps(['modelValue']); // v-model para abrir/fechar
const emit = defineEmits(['update:modelValue', 'login-sucesso']);

const email = ref('');
const password = ref('');
const erro = ref('');

const realizarLogin = async () => {
  try {
    const res = await fetch('http://127.0.0.1:8000/session/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: email.value, Password: password.value })
    });

    if (res.ok) {
      const user = await res.json();
      //define usuario em variavel no navegador
      localStorage.setItem('userId', user.User_Id);
      emit('login-sucesso', user); // Avisa que logou
      fechar();
    } else {
      erro.value = "Usuário ou senha inválidos";
    }
  } catch (e) {
    erro.value = "Erro ao conectar com o servidor";
  }
};
const fechar = () => emit('update:modelValue', false);//Função que define se o modal está fechado ou aberto

</script>

<template>
  <Teleport to="body">
    <!-- <div v-if="modelValue" class="modal-overlay" @click.self="fechar"> -->
    <div v-if="modelValue" class="modal-overlay">
        <div class="modal-content">
            <h2>Login</h2>
            <p>Email:</p> <input v-model="email" type="email" placeholder="E-mail">
            <p>Senha:</p> <input v-model="password" type="password" placeholder="Senha">
            <p v-if="erro" class="error">{{ erro }}</p>
            
            <div class="actions">
            <button class="btn-enviar" @click="realizarLogin">Entrar</button>
            </div>

        </div>
    </div>
  </Teleport>
</template>

<style scoped>
h2{
    text-align: center;
}
.modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
}
.modal-content {
  background: white; padding: 2rem; border-radius: 8px; width: 300px;
  display: flex; flex-direction: column; gap: 10px;color:#3c3c3c;
}
.error { color: red; font-size: 0.8rem; }
.actions{
    display: flex;
    justify-content: center;
}
.btn-cancel { background: #ccc; }
</style>
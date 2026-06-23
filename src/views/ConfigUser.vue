<script setup>
import { ref, getCurrentInstance, onMounted, computed} from 'vue';

// variaveis para uso de API
const app = getCurrentInstance()
const API_URL = app.appContext.config.globalProperties.$API_URL;
const userId = localStorage.getItem('userId');

const senha = ref("");
const confirmarSenha = ref("");

const AlterarSenha = async () =>{
    if (senha.value !== confirmarSenha.value){
        alert('Senhas diferentes!');
        return;
    }
    try{
        const res = await fetch(`${API_URL}/user/${userId}`,{
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                "Password": confirmarSenha.value
            })
        });
        if (res.ok){
            alert('Senha alterada com sucesso')
            senha = "";
            confirmarSenha = "";
        }else{
            const erro = await res.json();
            console.error("Erro da API:", erro);
        };
    }catch(error){
        console.error("Erro ao cadastrar registros:", error);
    }
};


</script>
<template>
    <!-- Alterar senha -->
    <h2>Alterar Senha</h2>
    <div class="flex-container-col">
        <span>Digite sua senha:</span>
        <input type="text" v-model="senha">
        <span>Confirme sua senha:</span>
        <input type="text" v-model="confirmarSenha">
        <button type="button" @click="AlterarSenha">Confirmar</button>
    </div>
</template>
<style>
/* .flex-container-col{
    display: flex;
    flex-direction: column;
    min-width: 500px;
} */
</style>
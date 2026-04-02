<script setup>
import {ref, onMounted, computed} from 'vue';

const log = ref([]);
const project = ref([]);
const tasks = ref([]);
const functions = ref([]);
const users = ref([]);

// 1. Esses guardam o que o usuário está mexendo na tela
const startDate = ref('');
const endDate = ref('');
const projectSelectId = ref(null);
const userSelectId = ref(null);
const taskSelectId = ref(null);

// 2. Esses guardam o filtro EFETIVO (só mudam ao clicar no botão)
const filtrosAplicados = ref({
    startDate: '',
    endDate: '',
    projectId: null,
    userId: null,
    taskId: null // Adicionado para inicializar corretamente
});

const API_URL = 'http://127.0.0.1:8000';

const getTimeLog = async() =>{
    try{
        const res = await fetch(`${API_URL}/TimeLog/`);
        if (res.ok){
            log.value = await res.json();
        }
    }catch(error){
        console.error("Erro ao buscar registros:", error)
    }
}
const getProjeto = async() =>{
    try{
        const res = await fetch(`${API_URL}/projects/`);
        if (res.ok){
            project.value = await res.json();
        }
    }catch (error){
        console.error("Erro ao buscar registros:", error)
    }
}
const getTask = async() =>{
    try{
        const res = await fetch(`${API_URL}/task/`);
        if (res.ok){
            tasks.value = await res.json();
        }
    }catch(error){
        console.error("Erro ao buscar registros:", error)
    }
}
const getUser = async() =>{
    try{
        const res = await fetch(`${API_URL}/user/`);
        if (res.ok){
            users.value = await res.json();
        }
    }catch(error){
        console.error("Erro ao buscar registros:", error)
    }
}

function validarDatas() {
  if (endDate.value && startDate.value > endDate.value) {
    endDate.value = startDate.value
  }
}

onMounted(() => {
    getTimeLog();
    getProjeto();
    getTask();
    getUser();
});
    
// 3. ESSA FUNÇÃO ATIVA O FILTRO CLICANDO NO BOTÃO
const filterLog = () => {
    filtrosAplicados.value = {
        startDate: startDate.value,
        endDate: endDate.value,
        projectId: projectSelectId.value,
        userId: userSelectId.value,
        taskId: taskSelectId.value
    };
}

const logsTraduzidos = computed(() => {
  return log.value.map(log => {
    const proj = project.value.find(p => p.Project_Id === log.Project_Id)
    const tsk = tasks.value.find(t => t.Task_Id === log.Task_Id)
    const user = users.value.find(u => u.User_Id === log.User_Id)

    return {
      ...log,
      Project_Name: proj ? proj.Name : 'Não encontrado',
      Task_Name: tsk ? tsk.Name : 'Não encontrada',
      User_Email: user ? user.Email: 'Não encontrado'
    }
  })
})

// 4. ESSA COMPLEMENTA FILTRANDO OS DADOS TRADUZIDOS
const logsFiltrados = computed(() => {
    return logsTraduzidos.value.filter(item => {
        const { startDate, endDate, projectId, userId, taskId } = filtrosAplicados.value;
        
        if (startDate && item.Date < startDate) return false;
        if (endDate && item.Date > endDate) return false;
        
        // Usando != em vez de !== para ignorar se um é texto e o outro é número
        if (projectId && item.Project_Id != projectId) return false;
        if (userId && item.User_Id != userId) return false;
        if (taskId && item.Task_Id != taskId) return false;
        
        return true;
    });
});

// 5. FUNÇÕES DE SOMA COMPUTADAS
const totalHorasNormais = computed(() => {
    const soma = logsFiltrados.value.reduce((acumulador, log) => {
        const horas = log.Hours_Worked ? parseFloat(log.Hours_Worked) : 0;
        return acumulador + horas;
    }, 0);
    return soma.toFixed(2);
});

const totalHorasExtras = computed(() => {
    const soma = logsFiltrados.value.reduce((acumulador, log) => {
        const horas = log.Overtime ? parseFloat(log.Overtime) : 0;
        return acumulador + horas;
    }, 0);
    return soma.toFixed(2);
});

</script>

<template>
    <div>
        <div>
            Data inicial <input type="date" v-model="startDate" @change="validarDatas()">
            Data Final <input type="date" v-model="endDate" :min="startDate">
        </div>
        <select v-model="userSelectId">
            <option :value="null">Todos os Usuários</option>
            <option v-for="user in users" :key="user.User_Id" :value="user.User_Id">
                {{ user.Email }}
            </option>
        </select>
        
        <select v-model="projectSelectId">
            <option :value="null">Todos os Projetos</option>
            <option v-for="proj in project" :key="proj.Project_Id" :value="proj.Project_Id">
                {{ proj.Name }}
            </option>
        </select>

        <select v-model="taskSelectId">
            <option :value="null">Todas as tarefas</option>
            <option v-for="task in tasks" :key="task.Task_Id" :value="task.Task_Id">
                {{ task.Name }}
            </option>
        </select>
        
        <button @click="filterLog">Filtrar</button>
    </div>
    <br>
    <div>
        <h3>List TimeLog:</h3>
        <table>
            <thead>
                <tr>
                    <th>Email:</th>
                    <th>Data:</th>
                    <th>Projeto:</th>
                    <th>Task:</th>
                    <th>Horas trabalhadas:</th>
                    <th>Horas extra:</th>
                </tr>
            </thead>
            
            <tbody>
                <tr v-for="log in logsFiltrados" :key="log.TimeLog_Id">
                    <td>{{ log.User_Email }}</td>
                    <td>{{ log.Date }}</td>
                    <td>{{ log.Project_Name }}</td>
                    <td>{{ log.Task_Name }}</td>
                    <td>{{ log.Hours_Worked }}</td>
                    <td>{{ log.Overtime }}</td>
                </tr>
            </tbody>

            <tfoot>
                <tr style="font-weight: bold; background-color: #f0f0f0;">
                    <td colspan="4" style="text-align: right;">Total:</td>
                    <td>{{ totalHorasNormais }}</td>
                    <td>{{ totalHorasExtras }}</td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<style>
td, th {
    padding: 5px;
    border-style: solid;
    border-width: 1px;
    text-align: left;
}
th {
    background-color: #e9e9e9;
}
</style>
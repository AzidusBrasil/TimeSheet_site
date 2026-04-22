<script setup>
import { ref, getCurrentInstance, onMounted, computed, watch} from 'vue';
const logs = ref([]);

// declaração de variaveis 
const Date = ref('');

const tasksAll = ref([]);
const tasks = ref([]);

const taskList = ref([]);

const subTask = ref([]);

const Description = ref('');
const Hours_Worked = ref('');
const Overtime = ref('');
const projects = ref([]); // Lista vinda da API

const projetoSelecionadoId = ref(null); // ID que o usuário escolher
const taskListSelecionadoId = ref(null); // ID que o usuário escolher
const taskSelecionadoId = ref(null); // ID que o usuário escolher
const subTaskSelecionadoId = ref(null); // ID que o usuário escolher

// variaveis para uso de API
const app = getCurrentInstance()
const API_URL = app.appContext.config.globalProperties.$API_URL;
const userId = localStorage.getItem('userId');

// Função para Carregar LOGs
const carregaLog = async() =>{
    try{
        const res = await fetch(`${API_URL}/TimeLog/${userId}`);
        if (res.ok) {
            logs.value = await res.json();
        }
    }catch(error){
        console.error("Erro ao buscar registros:", error)
    }
}

// Carregar Dados Iniciais
const get_projetos = async() =>{
    try{
        const res = await fetch(`${API_URL}/projects`);
        if (res.ok) {
            projects.value = await res.json();
        }
    } catch (error) {
        console.error("Erro ao carregar projetos:", error);
    }
}

const get_all_tasks = async() =>{
    try{
        const res = await fetch(`${API_URL}/task/`);
        if (res.ok) {
            tasksAll.value = await res.json();
        }
    } catch (error) {
        console.error("Erro ao carregar tasks gerais:", error);
    }
}

onMounted(() => {
    carregaLog();
    get_projetos();
    get_all_tasks();
});

// Cascata de Filtros DINÂMICOS
// 1. Projeto -> TaskList
const get_taskList = async() =>{
    try{
        const res = await fetch(`${API_URL}/TaskList/project/${projetoSelecionadoId.value}`);
        if (res.ok) {
            taskList.value = await res.json();
        }
    } catch (error) {
        console.error("Erro ao carregar TaskLists:", error);
    }
}

// 2. TaskList -> Task
const get_task = async() =>{
    try{
        const res = await fetch(`${API_URL}/task/tasklist/${taskListSelecionadoId.value}`);
        if (res.ok) {
            tasks.value = await res.json();
        }
    } catch (error) {
        console.error("Erro ao carregar tasks:", error);
    }
}

// 3. Task -> SubTask
const get_subTask = async() =>{
    try{
        const res = await fetch(`${API_URL}/SubTask/Task/${taskSelecionadoId.value}`);
        if (res.ok) {
            subTask.value = await res.json();
        }
    } catch (error) {
        console.error("Erro ao carregar subTasks:", error);
    }
}

// Observadores (Watchers) para limpar e carregar dados em cascata
watch(projetoSelecionadoId, (valorNovo) => {
    taskList.value = [];
    taskListSelecionadoId.value = null;
    tasks.value = [];
    taskSelecionadoId.value = null;
    subTask.value = [];
    subTaskSelecionadoId.value = null;
    if(valorNovo) get_taskList();
});

watch(taskListSelecionadoId, (valorNovo) => {
    tasks.value = [];
    taskSelecionadoId.value = null;
    subTask.value = [];
    subTaskSelecionadoId.value = null;
    if(valorNovo) get_task();
});

watch(taskSelecionadoId, (valorNovo) => {
    subTask.value = [];
    subTaskSelecionadoId.value = null;
    if(valorNovo) get_subTask();
});

// Funções para pegar NOMES nos Logs Salvos
const getProjectName = (projectId) => {
    const projeto = projects.value.find(p => p.Project_Id === projectId);
    return projeto ? projeto.Name : '';
};

const getTaskName = (taskId) => {
    const task = tasksAll.value.find(p => p.Task_Id === taskId);
    return task ? task.Name : '';
};

// Função para ADD LOG
const addLog = async () => {
    if (!Date.value || !projetoSelecionadoId.value || !taskSelecionadoId.value || !Hours_Worked.value){
        alert("Preencha os campos obrigatórios");
        return;
    };
    try{
        const res = await fetch(`${API_URL}/TimeLog/`,{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "Date": Date.value,
                "Description": Description.value,
                "Hours_Worked": Hours_Worked.value,
                "Overtime": Overtime.value || "00:00",
                "User_Id": userId,
                "Project_Id": projetoSelecionadoId.value,
                "TaskList_Id": taskListSelecionadoId.value,
                "Task_Id": taskSelecionadoId.value,
                "SubTask_Id": subTaskSelecionadoId.value
            })
        });

        if (res.ok) {
            await carregaLog(); 
            limpar_campos();
        } else {
            const erro = await res.json();
            console.error("Erro da API:", erro);
        }
    }catch(error){
        console.error("Erro ao cadastrar registros:", error)
    }
}

const limpar_campos = () =>{
    Date.value = "";
    projetoSelecionadoId.value = null;
    taskListSelecionadoId.value = null;
    taskSelecionadoId.value = null;
    subTaskSelecionadoId.value = null;
    Description.value = "";
    Hours_Worked.value = "";
    Overtime.value = "";
}

const deleteLog = async(TimeLog_Id) =>{
    try{
        const res = await fetch(`${API_URL}/TimeLog/${TimeLog_Id}`,{ "method":"DELETE" });
        if (res.ok){
            carregaLog();
        }
    }catch(error){
        console.error("Erro na requisição: Delete");
    }
};

// Funções auxiliares de conversão de tempo
const paraMinutos = (texto) => {
  if (!texto) return 0;
  const [h, m] = texto.split(':').map(Number);
  return (h * 60) + m;
};

const paraTexto = (totalMin) => {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const logsAgrupados = computed(() => {
  const grupos = {};
  logs.value.forEach(log => {
    const dia = log.Date; 
    if (!grupos[dia]) {
      grupos[dia] = { registros: [], totalMinutos: 0 };
    }
    grupos[dia].registros.push(log);
    grupos[dia].totalMinutos += paraMinutos(log.Hours_Worked) + paraMinutos(log.Overtime);
  });
  return grupos;
});
</script>

<template>
    <div class="caixa-com-scroll">
        <div v-for="(dados, data) in logsAgrupados" :key="data" class="div-section">
            <div class="div-header">
                <span>📅 Data: {{ data }}</span>
                <span class="total-badge">Total: {{ paraTexto(dados.totalMinutos) }}h</span>
            </div>
            <div class="log-row-title">
                <p>Projetos:</p>
                <p>Tasks:</p>
                <p>Horas trabalhadas:</p>
                <p>Horas extras:</p>
                <p>Ação:</p>
            </div>
            <div v-for="log in dados.registros" :key="log.TimeLog_Id" class="log-row">
                <input type="text" :value="getProjectName(log.Project_Id)" readonly>
                <input type="text" :value="getTaskName(log.Task_Id)" readonly>
                <input type="time" :value="log.Hours_Worked" readonly>
                <input type="time" :value="log.Overtime" readonly>
                <button @click="deleteLog(log.TimeLog_Id)">Delete</button>
            </div>
        </div>
    </div>

    <hr v-if="logs.length > 0">
    <br>
    <div class="container">
        <div class="flex-container">
            <h4 class="container-item">Data:</h4>  
            <input class="container-item" type="date" v-model="Date" required>
        </div>

        <div class="flex-container">
            <h4 class="container-item">Projeto:</h4> 
            <select class="container-item" v-model="projetoSelecionadoId" required>
                <option :value="null">Selecione...</option>
                <option v-for="project in projects" :key="project.Project_Id" :value="project.Project_Id">
                    {{ project.Name }}
                </option>
            </select>   
        </div>

        <div class="flex-container">
            <h4 class="container-item">TaskList:</h4>
                    <select class="container-item" v-model="taskListSelecionadoId">
                <option :value="null">Selecione...</option>
                <option v-for="list in taskList" :key="list.TaskList_Id" :value="list.TaskList_Id">
                    {{ list.Name }}
                </option>
            </select>
        </div>

        <div class="flex-container">
            <h4 class="container-item">Task:</h4> 
            <select class="container-item" v-model="taskSelecionadoId" required>
                <option :value="null">Selecione...</option>
                <option v-for="task in tasks" :key="task.Task_Id" :value="task.Task_Id">
                    {{ task.Name }}
                </option>
            </select>
        </div>

        <div class="flex-container">
            <h4 class="container-item">SubTask:</h4> 
            <select class="container-item" v-model="subTaskSelecionadoId">
                <option :value="null">Selecione...</option>
                <option v-for="sub in subTask" :key="sub.SubTask_Id" :value="sub.SubTask_Id">
                    {{ sub.Name }}
                </option>
            </select>
        </div>

        <div class="flex-container">
            <h4 class="container-item">Horas trabalhadas:</h4> 
            <input class="container-item" type="time" v-model="Hours_Worked" required>
        </div>

        <div class="flex-container">
            <h4 class="container-item">Horas extras:</h4>
                <input class="container-item" type="time" v-model="Overtime">
        </div>

        <div class="flex-container">
            <h4 class="container-item">Descrição:</h4>
            <input class="container-item" type="text" v-model="Description" placeholder="Opcional">
        </div>
        
        <div class="flex-container" >
            <button class="btn-enviar-log" @click="addLog">Enviar</button>
        </div>
    </div>
</template>

<style>
/* Seus estilos originais mantidos */
.container{
    display: flex;
    flex-wrap: wrap;
    align-items: end;
}

.flex-container{
    display: flex;
    flex-direction: column;
    margin-right: 5px;
}
.container-item {
    padding: 10px;
    text-align: left;
    min-height: 50px;
}
.btn-enviar-log{
    background-color: #2ecc71;
    border: none;
    color: #ffffff;
    font-size: 0.9rem;
    margin: 5px;
    padding: 12px;
    border-radius: 10%;
}
.btn-enviar-log:hover{
    background-color: #1f8f4d;
}
.div-section {
    margin-bottom: 2rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
}
.div-header {
    background-color: #f4f4f4;
    padding: 10px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: bold;
    border-bottom: 1px solid #ddd;
    color: #3b3939;
}
.total-badge {
    background: #2ecc71;
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
}
.log-row {
    display: grid;
    grid-template-columns: 1fr 1fr 100px 100px 100px;
    gap: 10px;
    padding: 8px 15px;
    border-bottom: 1px solid #eee;
}
.log-row-title{
    display: grid;
    grid-template-columns: 1fr 1fr 100px 100px 100px;
    padding: 8px 15px;
    gap: 10px;
    font-size: 0.8em;
    font-weight: bold;
}
.caixa-com-scroll {
    margin-top: 15px;
    width: 100%;
    height: 500px; 
    overflow-y: auto; 
    padding: 10px;
}
</style>
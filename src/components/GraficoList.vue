<script setup>
import { ref, getCurrentInstance, onMounted, computed, watch } from 'vue';

const log = ref([]);
const project = ref([]);
const taskList = ref([]); // Novo: Armazena as listas de tarefas
const tasks = ref([]);
const users = ref([]);

// 1. Estados dos filtros na tela
const startDate = ref('');
const endDate = ref('');
const projectSelectId = ref(null);
const taskListSelectId = ref(null); // Novo
const userSelectId = ref(null);
const taskSelectId = ref(null);

// 2. Filtro EFETIVO
const filtrosAplicados = ref({
    startDate: '',
    endDate: '',
    projectId: null,
    taskListId: null, // Novo
    userId: null,
    taskId: null
});

const app = getCurrentInstance()
const API_URL = app.appContext.config.globalProperties.$API_URL;

// --- Chamadas de API ---
const getTimeLog = async() => {
    try {
        const res = await fetch(`${API_URL}/TimeLog/`);
        if (res.ok) log.value = await res.json();
    } catch(error) { console.error("Erro logs:", error) }
}

const getProjeto = async() => {
    try {
        const res = await fetch(`${API_URL}/projects/`);
        if (res.ok) project.value = await res.json();
    } catch (error) { console.error("Erro projetos:", error) }
}

const getTaskList = async() => {
    if (!projectSelectId.value) {
        taskList.value = [];
        return;
    }
    try {
        const res = await fetch(`${API_URL}/taskList/project/${projectSelectId.value}`);
        if (res.ok) taskList.value = await res.json();
    } catch (error) { console.error("Erro tasklist:", error) }
}

const getTask = async() => {
    // Se tiver TaskList selecionada, busca por ela, senão busca geral ou limpa
    const url = taskListSelectId.value 
        ? `${API_URL}/task/${taskListSelectId.value}`
        : `${API_URL}/task/`;
    try {
        const res = await fetch(url);
        if (res.ok) tasks.value = await res.json();
    } catch(error) { console.error("Erro tasks:", error) }
}

const getUser = async() => {
    try {
        const res = await fetch(`${API_URL}/user/`);
        if (res.ok) users.value = await res.json();
    } catch(error) { console.error("Erro usuários:", error) }
}

// --- Watchers para Cascata ---
watch(projectSelectId, () => {
    taskListSelectId.value = null;
    taskSelectId.value = null;
    getTaskList();
});

watch(taskListSelectId, () => {
    taskSelectId.value = null;
    getTask();
});

onMounted(() => {
    getTimeLog();
    getProjeto();
    getTask();
    getTaskList();
    getUser();
});

const filterLog = () => {
    filtrosAplicados.value = {
        startDate: startDate.value,
        endDate: endDate.value,
        projectId: projectSelectId.value,
        taskListId: taskListSelectId.value,
        userId: userSelectId.value,
        taskId: taskSelectId.value
    };
}

// --- Lógica de Soma e Tradução (Mantida conforme anterior) ---
const logsFiltrados = computed(() => {
    return log.value.map(l => {
        const p = project.value.find(proj => proj.Project_Id === l.Project_Id);
        const t = tasks.value.find(tsk => tsk.Task_Id === l.Task_Id);
        const u = users.value.find(usr => usr.User_Id === l.User_Id);
        return { 
            ...l, 
            Project_Name: p ? p.Name : '-', 
            Task_Name: t ? t.Name : '-', 
            User_Email: u ? u.Email : '-' 
        };
    }).filter(item => {
        const f = filtrosAplicados.value;
        if (f.startDate && item.Date < f.startDate) return false;
        if (f.endDate && item.Date > f.endDate) return false;
        if (f.projectId && item.Project_Id != f.projectId) return false;
        if (f.taskListId && item.TaskList_Id != f.taskListId) return false;
        if (f.userId && item.User_Id != f.userId) return false;
        if (f.taskId && item.Task_Id != f.taskId) return false;
        return true;
    });
});

const tempoParaMinutos = (t) => {
    if (!t || !t.includes(':')) return 0;
    const [h, m] = t.split(':').map(Number);
    return (h * 60) + m;
};

const minutosParaTempo = (m) => {
    return `${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
};

const totalHorasNormais = computed(() => minutosParaTempo(logsFiltrados.value.reduce((acc, i) => acc + tempoParaMinutos(i.Hours_Worked), 0)));
const totalHorasExtras = computed(() => minutosParaTempo(logsFiltrados.value.reduce((acc, i) => acc + tempoParaMinutos(i.Overtime), 0)));

</script>

<template>
    <div class="filtros-container">
        <div class="campo-grupo datas">
            <div class="input-individual">
                <label>Início:</label>
                <input type="date" v-model="startDate">
            </div>
            <div class="input-individual">
                <label>Fim:</label>
                <input type="date" v-model="endDate">
            </div>
        </div>

        <div class="campo-grupo selects">
            <div class="input-individual">
                <label>Usuário:</label>
                <select v-model="userSelectId">
                    <option :value="null">Todos</option>
                    <option v-for="u in users" :key="u.User_Id" :value="u.User_Id">{{ u.Email }}</option>
                </select>
            </div>
            
            <div class="input-individual">
                <label>Projeto:</label>
                <select v-model="projectSelectId">
                    <option :value="null">Todos</option>
                    <option v-for="p in project" :key="p.Project_Id" :value="p.Project_Id">{{ p.Name }}</option>
                </select>
            </div>

            <div class="input-individual">
                <label>TaskList:</label>
                <select v-model="taskListSelectId" :disabled="!projectSelectId">
                    <option :value="null">Todas</option>
                    <option v-for="l in taskList" :key="l.TaskList_Id" :value="l.TaskList_Id">{{ l.Name }}</option>
                </select>
            </div>

            <div class="input-individual">
                <label>Tarefa:</label>
                <select v-model="taskSelectId">
                    <option :value="null">Todas</option>
                    <option v-for="t in tasks" :key="t.Task_Id" :value="t.Task_Id">{{ t.Name }}</option>
                </select>
            </div>
        </div>
        
        <div class="acoes-container">
            <button class="btn-filtrar" @click="filterLog">🔍 Filtrar</button>
        </div>
    </div>

    <div class="tabela-container">
        <table>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Data</th>
                    <th>Projeto</th>
                    <th>Task</th>
                    <th>Horas</th>
                    <th>Extra</th>
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
                <tr class="total-linha">
                    <td colspan="4">Total Acumulado:</td>
                    <td>{{ totalHorasNormais }}</td>
                    <td>{{ totalHorasExtras }}</td>
                </tr>
            </tfoot>
        </table>
    </div>
</template>

<style scoped>
.filtros-container {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: flex-end;
    background: #f8fafc;
    padding: 15px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
}
.campo-grupo { display: flex; gap: 8px; flex-wrap: wrap; flex: 1; }
.input-individual { display: flex; flex-direction: column; flex: 1; min-width: 130px; }
.input-individual label { font-size: 0.75rem; font-weight: bold; color: #64748b; margin-bottom: 4px; }
.input-individual input, .input-individual select { 
    height: 35px; border: 1px solid #cbd5e1; border-radius: 4px; padding: 0 8px; font-size: 0.85rem; 
}
.btn-filtrar { height: 35px; padding: 0 15px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.tabela-container { margin-top: 20px; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: left; font-size: 0.85rem; }
th { background: #f1f5f9; }
.total-linha { background: #f8fafc; font-weight: bold; }
</style>
<script setup>
import { ref, onMounted, computed, watch} from 'vue';
const logs = ref([]);

// declaração de variaveis 
let id = 0;
const Date = ref('');

const tasksAll = ref([]);
const tasks = ref([]);

const functions = ref([]);
const functionsAll = ref([]);

const Description = ref('');
const Hours_Worked = ref('');
const Overtime = ref('');
const projects = ref([]); // Lista vinda da API

const projetoSelecionadoId = ref(null); // ID que o usuário escolher
const taskSelecionadoId = ref(null); // ID que o usuário escolher
const functionSelecionadoId = ref(null); // ID que o usuário escolher
//variaveis para uso de API
const API_URL = 'http://127.0.0.1:8000';
const userId = localStorage.getItem('userId');

//Função para Carregar LOGs
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
//Exibe sempre que a pagina é recarregada
onMounted(() => {
    carregaLog();
});

// Função para ADD LOG
const addLog = async () => {
    if (!Date.value|| !projetoSelecionadoId.value|| !taskSelecionadoId.value|| !Hours_Worked.value){
        alert("Preencha os campos em branco");
        return
    };
    try{
        const res = await fetch(`${API_URL}/TimeLog/`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json" // OBRIGATÓRIO
            },
            body: JSON.stringify({
                "Date": Date.value,
                "Description": Description.value,
                "Hours_Worked": Hours_Worked.value,
                "Overtime": Overtime.value,
                "User_Id": userId,
                "Project_Id": projetoSelecionadoId.value,
                "Task_Id": taskSelecionadoId.value
            })
        });

        if (res.ok) {
            await carregaLog(); // Espera recarregar a lista
            limpar_campos();
            console.log(res.json());
        } else {
            const erro = await res.json();
            console.error("Erro da API:", erro);
        }

    }catch(error){
        console.error("Erro ao cadastrar registros:", error)
    }
}

const limpar_campos = () =>{
    // limpar variaveis
    Date.value = "";
    projetoSelecionadoId.value = "";
    taskSelecionadoId.value = "";
    Description.value = "";
    Hours_Worked.value = "";
    Overtime.value = "";
}

// PROJECTS
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
// Função para encontrar o nome do projeto pelo ID
const getProjectName = (projectId) => {
    // Procura na lista de projetos o objeto que tem o ID igual ao do log
    const projeto = projects.value.find(p => p.Project_Id === projectId);
    // Retorna o nome se encontrar, ou um aviso se não encontrar
    return projeto ? projeto.Name : '';
};

// FUNCTION
const get_function = async() =>{
    try{
        const res = await fetch(`${API_URL}/function/${projetoSelecionadoId.value}`);
            if (res.ok) {
                functions.value = await res.json();
            }
    } catch (error) {
        console.error("Erro ao carregar projetos:", error);
    }
}
// Pega todas as tasks para a função carregar log
const get_all_function = async() =>{
    try{
        const res = await fetch(`${API_URL}/task/`);
            if (res.ok) {
                functionsAll.value = await res.json();
            }
    } catch (error) {
        console.error("Erro ao carregar Functions:", error);
    }
}
// TASK
const get_task = async() =>{
    try{
        const res = await fetch(`${API_URL}/task/${functionSelecionadoId.value}`);
            if (res.ok) {
                tasks.value = await res.json();
            }
    } catch (error) {
        console.error("Erro ao carregar projetos:", error);
    }
}
// Pega todas as tasks para a função carregar log
const get_all_task = async() =>{
    try{
        const res = await fetch(`${API_URL}/task/`);
            if (res.ok) {
                tasksAll.value = await res.json();
            }
    } catch (error) {
        console.error("Erro ao carregar projetos:", error);
    }
}

// Função para encontrar o nome do task pelo ID
const getFunctionName = (functionId) => {
    // Procura na lista de projetos o objeto que tem o ID igual ao do log
    const func = functionsAll.value.find(p => p.Function_Id === functionId);
    // Retorna o nome se encontrar, ou um aviso se não encontrar
    return func ? func.Name : '';
};
// Função para encontrar o nome do task pelo ID
const getTaskName = (taskId) => {
    // Procura na lista de projetos o objeto que tem o ID igual ao do log
    const task = tasksAll.value.find(p => p.Task_Id === taskId);
    // Retorna o nome se encontrar, ou um aviso se não encontrar
    return task ? task.Name : '';
};

onMounted(get_projetos);
onMounted(get_all_task);
onMounted(get_all_function);
// GET function
watch(projetoSelecionadoId,(valorNovo, valorAntigo) => {
    if(valorNovo){
        tasks.value = [];
        taskSelecionadoId.value = "";
        functions.value = [];
        functionSelecionadoId.value = "";
        get_function();
    }
});
// GET TASKs
watch(functionSelecionadoId,(valorNovo, valorAntigo) => {
    if(valorNovo){
        tasks.value = [];
        taskSelecionadoId.value = "";
        get_task();
    }
});

// Funções auxiliares de conversão
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

// A variável mágica que organiza tudo
const logsAgrupados = computed(() => {
  const grupos = {};

  logs.value.forEach(log => {
    const dia = log.Date; // "2026-03-24"
    
    // Se o dia ainda não existe no objeto, criamos a estrutura
    if (!grupos[dia]) {
      grupos[dia] = {
        registros: [],
        totalMinutos: 0
      };
    }

    // Adiciona o log ao dia correspondente
    grupos[dia].registros.push(log);
    
    // Soma as horas (Trabalhadas + Extras)
    grupos[dia].totalMinutos += paraMinutos(log.Hours_Worked) + paraMinutos(log.Overtime);
  });

  return grupos;
});

// função deletar time log
const deleteLog = async(TimeLog_Id) =>{
    try{
        const res = await fetch(`${API_URL}/TimeLog/${TimeLog_Id}`,{
            "method":"DELETE"
        });
        if (res.ok){
            carregaLog();
        }
    }catch(error){
        console.error("Erro na requisição: Delete");
    }
};

</script>


<template>
    <div class="caixa-com-scroll">
        <!-- Itera sobre o objeto: 'dados' contém os registros e o total, 'data' é a chave -->
        <div v-for="(dados, data) in logsAgrupados" :key="data" class="dia-section">
            <div class="dia-header">
                <span>📅 Data: {{ data }}</span>
                <!-- Convertemos os minutos acumulados de volta para formato de hora aqui -->
                <span class="total-badge">Total: {{ paraTexto(dados.totalMinutos) }}h</span>
            </div>
            <div class="log-row-title">
                <p>Projetos:</p>
                <p>Tasks:</p>
                <p>Horas trabalhadas:</p>
                <p>Horas extras:</p>
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
        <h3 class="container-item">Data:</h3>  
        <h3 class="container-item">Projeto:</h3> 
        <h3 class="container-item">Função:</h3> 
        <h3 class="container-item">Tarefa:</h3> 
        <h3 class="container-item">Descrição:</h3> 
        <h3 class="container-item">Horas trabalhadas:</h3> 
        <h3 class="container-item">Horas extras:</h3>
        <!-- <h3 class="container-item">Total:</h3> -->
    </div>
    <div class="container">
        <input class="container-item" type="date" v-model="Date" required>
        <!-- Projeto -->
        <select class="container-item" v-model="projetoSelecionadoId" required>
            <option v-for="project in projects" :key="project.Project_Id" :value="project.Project_Id"
                >
                {{ project.Name }}
            </option>
        </select>   
        <!-- FUNÇÃO -->
        <select class="container-item" v-model="functionSelecionadoId">
            <option v-for= "func in functions" :key="func.Function_Id" :value="func.Function_Id">
                {{ func.Name }}
            </option>
        </select>
            <!-- TASK -->
        <select class="container-item" v-model="taskSelecionadoId">
            <option v-for= "task in tasks" :key="task.Task_Id" :value="task.Task_Id">
                {{ task.Name }}
            </option>
        </select>
        <input class="container-item" type="text" v-model="Description">
        <input class="container-item" type="time" v-model="Hours_Worked" required>
        <input class="container-item" type="time" v-model="Overtime">
        <button @click="addLog" >Enviar</button>
    </div>
</template>

<style>
.container{
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
    }
.container-item {
        padding: 10px;
        text-align: left;
    }

.dia-section {
  margin-bottom: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.dia-header {
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
  grid-template-columns: 0.5fr 1fr 100px 100px 2fr;
  gap: 10px;
  padding: 8px 15px;
  border-bottom: 1px solid #eee;
}
.log-row-title{
    display: grid;
    grid-template-columns: 0.7fr 1fr 100px 100px 2fr;
    padding: 8px 15px;
    gap: 10px;
    font-size: 0.8em;
}
.caixa-com-scroll {
    margin-top: 15px;
    width: 100%;
    height: 500px; /* Altura fixa é obrigatória para o scroll vertical */
    /* O segredo está aqui: */
    overflow-y: auto; /* Adiciona scroll apenas se o conteúdo transbordar */
    padding: 10px;
}
</style>
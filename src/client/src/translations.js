// Main Layout
const mainLayout = {
    appName: "studyboard",
    loading: "A carregar...",
    error: "Ocorreu um erro",
};

// Navigation Menu
const navigation = {
    home: "Início",
    messageOfTheDay: "Mensagem do dia",
    subjects: "Disciplinas",
    activities: "Atividades"
};

// Authentication
const auth = {
    login: "Iniciar sessão",
    logout: "Terminar sessão",
    loading: "A carregar...",
};

// Error Page
const errorPage = {
    title: "Erro de autenticação",
    errorCode: "Código de erro",
    errorType: "Tipo de erro",
    description: "Descrição",
    unknownError: "Ocorreu um erro desconhecido durante a autenticação.",
    returnHome: "Voltar ao início"
};

// Homepage
const home = {
    locale: "pt-PT",
    welcome: "Seja bem vindo(a)",
    pendingActivities: "Atividades pendentes",
    noActivities: "Parabéns, você não tem atividades pendentes!",
    loadingActivities: "A carregar atividades...",
};

// Activity Management
const activities = {
    status: "Estado",
    pending: "Pendente",
    partiallyDone: "Parcialmente concluído",
    done: "Concluído",
    new: "Nova atividade para",
    edit: "Editar atividade para",
    form: {
        description: "Descrição",
        dueDate: "Data limite",
        status: "Estado",
        comments: "Comentários",
        createButton: "Criar atividade",
        updateButton: "Atualizar atividade",
        cancelButton: "Cancelar"
    },
    list: {
        title: "Atividades para",
        due: "Prazo",
        noActivities: "Não foram encontradas atividades",
        editButton: "Editar",
        deleteButton: "Eliminar"
    },
    loading: "A carregar...",
    error: {
        fetch: "Erro ao carregar atividades",
        create: "Erro ao criar atividade",
        update: "Erro ao atualizar atividade",
        delete: "Erro ao eliminar atividade"
    }
};

// Subject Management
const subjects = {
    new: "Nova disciplina",
    edit: "Editar disciplina",
    form: {
        name: "Nome",
        createButton: "Criar disciplina",
        updateButton: "Atualizar disciplina",
        cancelButton: "Cancelar"
    },
    list: {
        title: "Disciplinas",
        noSubjects: "Não foram encontradas disciplinas",
        editButton: "Editar",
        deleteButton: "Eliminar"
    },
    loading: "A carregar...",
    error: {
        fetch: "Erro ao carregar disciplinas",
        create: "Erro ao criar disciplina",
        update: "Erro ao atualizar disciplina",
        delete: "Erro ao eliminar disciplina"
    }
};

// Message of the Day Management
const motd = {
    new: "Nova mensagem do dia",
    form: {
        message: "Mensagem",
        author: "Autor",
        link: "Link",
        createButton: "Criar mensagem"
    },
    list: {
        title: "Mensagens existentes",
        author: "Autor",
        relatedLink: "Link relacionado",
        deleteButton: "Eliminar"
    },
    loading: "A carregar...",
    error: {
        fetch: "Erro ao carregar mensagens",
        create: "Erro ao criar mensagem",
        update: "Erro ao atualizar mensagem",
        delete: "Erro ao eliminar mensagem"
    }
};

export {
    mainLayout,
    navigation,
    auth,
    errorPage,
    home,
    activities,
    subjects,
    motd
};
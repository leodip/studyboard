const layout = {
    appName: "studyboard",
    locale: "pt-PT",
    loading: "A carregar...",
    toggleSidebar: "Alternar barra lateral",
    closeModal: "Fechar modal",
};

const navigation = {
    home: "Início",
    messageOfTheDay: "Mensagem do dia",
    subjects: "Disciplinas",
    activities: "Atividades",
    auditLogs: "Registos de auditoria",
    about: "Sobre",
};

const auth = {
    login: "Iniciar sessão",
    logout: "Terminar sessão",
};

const home = {
    noPendingActivities: "Não foram encontradas atividades pendentes",
    noCompletedActivities: "Não foram encontradas atividades concluídas",
};

const activities = {
    status: "Estado",
    pending: "Pendente",
    partiallyDone: "Parcialmente concluído",
    done: "Concluído",
    new: "Nova atividade",
    edit: "Editar atividade",
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
        title: "Atividades de",
        due: "Prazo",
        noActivities: "Não foram encontradas atividades",
        editButton: "Editar",
        deleteButton: "Eliminar"
    },
    error: {
        fetch: "Erro ao carregar atividades",
        create: "Erro ao criar atividade",
        update: "Erro ao atualizar atividade",
        delete: "Erro ao eliminar atividade"
    },
    delete: {
        title: "Eliminar atividade",
        confirmation: "Tem a certeza que pretende eliminar esta atividade?",
        confirmButton: "Sim, eliminar",
        cancelButton: "Cancelar"
    },
};

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
        deleteButton: "Eliminar",
        nameColumn: "Nome",
        actionsColumn: "Ações"
    },
    error: {
        fetch: "Erro ao carregar disciplinas",
        create: "Erro ao criar disciplina",
        update: "Erro ao atualizar disciplina",
        delete: "Erro ao eliminar disciplina"
    },
    delete: {
        title: "Eliminar disciplina",
        confirmation: "Tem a certeza que pretende eliminar esta disciplina?",
        confirmButton: "Sim, eliminar",
        cancelButton: "Cancelar"
    }
};

const motd = {
    new: "Nova mensagem do dia",
    edit: "Editar mensagem do dia",
    form: {
        message: "Mensagem",
        author: "Autor",
        link: "Ligação",
        createButton: "Criar mensagem",
        updateButton: "Atualizar mensagem",
        cancelButton: "Cancelar"
    },
    list: {
        title: "Mensagens do dia",
        author: "Autor",
        message: "Mensagem",
        relatedLink: "Ligação relacionada",
        actions: "Ações",
        editButton: "Editar",
        deleteButton: "Eliminar",
        noMessages: "Não foram encontradas mensagens"
    },
    delete: {
        title: "Eliminar mensagem",
        confirmation: "Tem a certeza que pretende eliminar esta mensagem?",
        confirmButton: "Sim, eliminar",
        cancelButton: "Cancelar"
    },
    error: {
        fetch: "Erro ao carregar mensagens",
        create: "Erro ao criar mensagem",
        update: "Erro ao atualizar mensagem",
        delete: "Erro ao eliminar mensagem",
        general: "Ocorreu um erro"
    }
};

const auditLogs = {
    title: "Registos de auditoria",
    timestamp: "Data/hora",
    user: "Utilizador",
    action: "Ação",
    entityType: "Tipo",
    entityId: "ID",
    changes: "Alterações",
    oldValues: "Valores anteriores",
    newValues: "Novos valores",
    loading: "A carregar registos...",
    error: {
        fetch: "Erro ao carregar registos de auditoria",
    },
    pagination: {
        showing: "Mostrando página",
        of: "de",
        previous: "Anterior",
        next: "Próxima"
    }
};

const about = {
    title: "Sobre o studyboard",
    description: "O Studyboard é uma aplicação simples para ajudar estudantes a organizar as suas tarefas escolares. Desenvolvido com carinho para ajudar no sucesso escolar."
};

export {
    layout,
    navigation,
    auth,
    home,
    activities,
    subjects,
    motd,
    about,
    auditLogs
};
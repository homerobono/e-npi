export const Globals = Object.freeze({
	SERVER_BASE_URL: 'http://201.77.131.165:1110',
	LOCAL_BASE_URL: 'http://127.0.0.1:3000',
	//ENPI_SERVER_URL : 'http://201.77.131.165:1110/e-npi/v2',
	//ENPI_SERVER_URL : 'http://192.168.10.121:1110/e-npi/v2',
	//ENPI_SERVER_URL: 'http://10.0.0.175:1110/e-npi/v2',
	ENPI_SERVER_URL: 'http://127.0.0.1:1110/e-npi/v2',
	LOCAL_ENPI_URL: 'http://127.0.0.1:1110/e-npi/v2',

	STATUS: [
		'Cancelado',
		'Rascunho',
		'Análise Crítica',
		'Aprovação do Cliente',
		'Desenvolvimento',
		'Concluído'
	],

	DEPARTMENTS: [
		{ value: 'ADM', label: 'Administrativo' },
		{ value: 'COM', label: 'Comercial' },
		{ value: 'COMP', label: 'Compras' },
		{ value: 'EPROD', label: 'Engenharia de Produção' },
		{ value: 'EPROC', label: 'Engenharia de Processos' },
		{ value: 'FIN', label: 'Financeiro' },
		{ value: 'MKT', label: 'Marketing' },
		{ value: 'P&D', label: 'P&D' },
		{ value: 'PROD', label: 'Produção' },
		{ value: 'PRD', label: 'Produto' },
		{ value: 'RH', label: 'R.H.' },
		{ value: 'OPR', label: 'Operações' },
		{ value: 'MEP', label: 'Ministério de Engenharia Privada' },
		{ value: 'CSC', label: 'Controle Seccionado de Capacidade' }
	],

	OEM_ACTIVITIES: [
		{ title: 'Solicitação de Documentos (BOM, Gerbers, etc)', dept: 'COM' },
		{ title: 'Solicitação do NCM', dept: 'COM' },
		{ title: 'Cotação da BOM', dept: 'MSC' },
		{ title: 'Estimativa de Capacidade Produtiva', dept: 'OPR' },
		{ title: 'Definição de RMA/Garantia', dept: 'COM' },
		{ title: 'Formação de Preço', dept: 'COM' },
		{ title: 'Avaliação de Capacidade Financeira', dept: 'FIN' },
		{ title: 'Data da Proposta', dept: 'COM' }
	],

	LABELS: {
		number: 'Número',
		created: 'Data de Criação',
		stage: 'Status',
		status: 'Status',
		npiRef: 'NPI de Referência',
		complexity: 'Complexidade',
		description: 'Requisitos',
		annex: 'Anexos',
		client: 'Cliente',
		requester: 'Solicitante',
		name: 'Nome da NPI',
		cost: 'Custo',
		price: 'Preço',
		resources: 'Recursos',
		norms: 'Normas Aplicáveis',
		investment: 'Valor de Investimento',
		fiscals: 'Inc. Fiscais',
		projectCost: 'Custo do Projeto',
		activities: 'Atividades',
		inStockDate: 'Data em Estoque',
		inStockDateType: 'Data em Estoque',
		regulations: 'Regulamentações',
		demand: 'Demanda',
		OemActivities: 'Atividades O&M',
		critical: 'Análise Crítica',
		dev: 'Desenvolvimento',
		finished: 'Concluído',
		canceled: 'Cancelado',
		draft: 'Rascunho'
	},

	ENTRIES: {
		pixel: 'Pixel',
		oem: 'O&M',
		internal: 'Interno',
		custom: 'Customização'
	},

	ENTRIES_ARR: [
		{ value: 'pixel', label: 'Pixel' },
		{ value: 'oem', label: 'O&M' },
		{ value: 'internal', label: 'Interno' },
		{ value: 'custom', label: 'Customização' },
	],

	MACRO_STAGES: [
		{ value: 'SCHED', label: 'Cronograma', dept: 'MEP' },
		{ value: 'LAYOUT', label: 'Esquemático, Layout e Gerber', dept: 'MEP' },
		{ value: 'FIRMWARE', label: 'Firmware, Software e Aplicativo', dept: 'MEP' },
		{ value: 'MECHANICS', label: 'Mecânica', dept: 'MEP' },
		{ value: 'SPECS', label: 'Especificação Técnica', dept: 'MEP' },
		{ value: 'BOM', label: 'Lista de Materiais - BOM', dept: 'MEP' },
		{ value: 'QUOTATION', label: 'Cotação', dept: 'CSC' },
		{ value: 'REQUIRE', label: 'Validação de Requisitos de Entrada', dept: 'MEP' },
		{ value: 'STATIONERY', label: 'Papelaria (Embalagem, Etiquetas, Manuais, Guias, etc)', dept: 'MEP' },
		{ value: 'BOM_REG', label: 'Cadastro da BOM', dept: 'MEP' },
		{ value: 'TEST', label: 'IT de Teste', dept: 'MEP' },
		{ value: 'JIG', label: 'Jiga de Testes', dept: 'P&D' },
		{ value: 'PROD', label: 'Processo Produtivo', dept: 'MEP' },
		{ value: 'PILOT', label: 'Lote Piloto', dept: 'MEP' },
		{ value: 'ASSEMBLY', label: 'IT de Montagem', dept: 'MEP' },
		{ value: 'GOLD', label: 'Golden Sample', dept: 'MEP' },
	],

	REGULATIONS: [
		{ value: 'abnt', label: 'ABNT' },
		{ value: 'anatel', label: 'ANATEL' },
		{ value: 'inmetro', label: 'INMETRO' },
		{ value: 'anvisa', label: 'ANVISA' },
		{ value: 'other', label: 'Outro(s)' }
	],

	DEMAND_PERIODS: [
		{ value: 'year', label: 'por ano'},
		{ value: 'month', label: 'por mês'},
		{ value: 'day', label: 'por dia'},
		{ value: 'unique', label: 'uma vez'},
	],

	CURRENCIES: [
		{ value: 'BRL', label: 'R$'},
		{ value: 'USD', label: 'US$'},
		{ value: 'EUR', label: '€'},
	]
})

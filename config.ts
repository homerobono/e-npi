export const Globals = Object.freeze ({
	SERVER_BASE_URL : 'http://201.77.131.165:1110',
	LOCAL_BASE_URL : 'http://127.0.0.1:3000',
	//ENPI_SERVER_URL : 'http://201.77.131.165:1110/e-npi/v2',
	//ENPI_SERVER_URL : 'http://192.168.10.121:1110/e-npi/v2',
	ENPI_SERVER_URL : 'http://127.0.0.1:1110/e-npi/v2',
	LOCAL_ENPI_URL : 'http://127.0.0.1:1110/e-npi/v2',

	STATUS : [
		'Cancelado',
		'Rascunho',
		'Análise Crítica',
		'Desenvolvimento',
		'Concluído'
	],

	DEPARTMENTS : [ 
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
		{ value: 'OPR', label: 'Operações' }
	],
	
	OEM_ACTIVITIES : [
		{ title: 'Solicitação de Documentos (BOM, Gerbers, etc)', dept: 'COM' },
		{ title: 'Solicitação do NCM', dept: 'COM' },
		{ title: 'Cotação da BOM', dept: 'MSC' },
		{ title: 'Estimativa de Capacidade Produtiva', dept: 'OPR' },
		{ title: 'Definição de RMA/Garantia', dept: 'COM' },
		{ title: 'Formação de Preço', dept: 'COM' },
		{ title: 'Avaliação de Capacidade Financeira', dept: 'FIN' },
		{ title: 'Data da Proposta', dept: 'COM' }
	],
})
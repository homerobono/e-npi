export const Globals = Object.freeze({
	//SERVER_BASE_URL: 'http://201.77.131.165:1110',
	//LOCAL_BASE_URL: 'http://127.0.0.1:3000',
	//ENPI_SERVER_URL : 'http://201.77.131.165:1110/e-npi/v2',
	//ENPI_SERVER_URL : 'http://192.168.10.121:1110/e-npi/v2',
	//ENPI_SERVER_URL: 'http://10.0.0.175:1110/e-npi/v2',
	ENPI_SERVER_URL: 'http://191.252.113.160:1110/e-npi/v2',
	//ENPI_SERVER_URL : 'http://191.252.113.160:1110/e-npi/v2',
	LOCAL_ENPI_URL: 'http://191.252.113.160:1110/e-npi/v2',

	STATUS: [
		'Cancelado',
		'Rascunho',
		'Análise Crítica',
		'Aprovação do Cliente',
		'Desenvolvimento',
		'Concluído'
	],

	DEPARTMENTS: [
		{ value: 'COM', label: 'Comercial' },
		{ value: 'OSC', label: 'Compras' },
		{ value: 'ADM', label: 'Administrativo' },
		{ value: 'MPD', label: 'P&D' },
		{ value: 'MPR', label: 'Produto' },
		{ value: 'OPR', label: 'Operações' },
		{ value: 'MEP', label: 'Processo' }
	],

	NPI_PIXEL_CRITICAL_DEPTS: ['MPR', 'MEP', 'OPR', 'ADM', 'COM'],
	NPI_INTERNAL_CRITICAL_DEPTS: ['MEP', 'OPR', 'ADM', 'COM'],
	NPI_CUSTOM_CRITICAL_DEPTS: ['MEP', 'OPR', 'ADM', 'COM'],
	NPI_OEM_CRITICAL_DEPTS: ['MEP', 'OPR', 'ADM', 'COM'],

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
		draft: 'Rascunho',
		finalApproval: 'Aprovação Final'
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

	ACTIVITIES_DEPTS: ['MPD', 'OSC', 'MPR', 'MEP', 'COM', 'OPR'],

	MACRO_STAGES: [
		{ value: 'SPECS_HW', 	label:'Especificação Técnica - Funcionalidade HW',  dept: 'MPR', term: 1, required: true },
		{ value: 'SPECS_SW', 	label:'Especificação Técnica - Funcionalidade de SW',dept:'MPR', term: 1 },
		{ value: 'MECH_SPEC', 	label: 'Especificação Mecânica/Dimensional', 		dept: 'MPR', term: 1 },
		{ value: 'ELETRIC_LAYOUT',label:'Esquema Elétrico/Layout', 					dept: 'MPD', term: 60,dep: ["SPECS_HW"] },
		{ value: 'BOM_DESC', 	label: 'BOM com P/N, Descrição', 					dept: 'MEP', term: 5, dep: ["ELETRIC_LAYOUT"], required: true },
		{ value: 'GERBER', 		label: 'Arquivo Gerber', 							dept: 'MPD', term: 5, dep: ["ELETRIC_LAYOUT"] },
		{ value: 'MECH_LAYOUT', label: 'Desenho de Partes Mecânicas', 				dept: 'MPR', term: 60,dep: ["MECH_SPEC"] },
		{ value: 'FIRMWARE', 	label: 'Firmware', 									dept: 'MPD', term: 10,dep: ["GERBER"] },
		{ value: 'BOM_PRICE', 	label: 'Cotação/Compra da BOM', 					dept: 'OSC', term: 5, dep: ["GERBER", "BOM_DESC"], required: true },
		{ value: 'PROTO_ASSEMB',label: 'Montagem de Protótipo', 					dept: 'MPD', term: 30,dep: ["BOM_PRICE","FIRMWARE","BOM_PRICE"] },
		{ value: 'PROTO_SW', 	label: 'Protótipo de Software', 					dept: 'MPD', term:100,dep: ["SPECS_SW"] },
		{ value: 'PROTO_TEST', 	label: 'Testes de Verficação/Validação de Protótipo',dept: 'MPR',term: 15,dep: ["PROTO_ASSEMB"], },
		{ value: 'DEVICE', 		label: 'Dispositivos/Moldes', 						dept: 'MPR', term: 90,dep: ["MECH_LAYOUT"] },
		{ value: 'TEMPLATE', 	label: 'Estêncil/Templates', 						dept: 'MEP', term: 5, dep: ["PROTO_TEST" ] },
		{ value: 'DATASHEET', 	label: 'Datasheet', 						 		dept: 'MPR', term: 5, dep: ["PROTO_TEST"], required: true },
		{ value: 'TAG_SPEC', 	label: 'Desenho/Especificação de Etiquetas', 		dept: 'MPR', term: 5, dep: ["DATASHEET"] },
		{ value: 'PACKING_SPEC',label:'Desenho/Especificação de Embalagem Individual',dept:'MPR',term:10, dep: ["DATASHEET"] },
		{ value: 'MANUAL', 		label: 'Manual para o Produto', 					dept: 'MPR', term: 10,dep: ["DATASHEET"] },
		{ value: 'HOMOLOG', 	label: 'Entrada Homologação', 						dept: 'MPR', term:150,dep: ["DATASHEET"] },
		{ value: 'JIG', 		label: 'Equipamento e Jiga de Testes',				dept: 'MPD', term: 10,dep: ["PROTO_TEST"] },
		{ value: 'TEST_INSTR', 	label: 'Instrução de Teste', 						dept: 'MPD', term: 5, dep: ["JIG"], required: true },
		{ value: 'ASSEMB_TOOLS',label: 'Definição de Ferramentas para Montagem', 	dept: 'MEP', term: 10,dep: ["PROTO_TEST"] },
		{ value: 'ASSEMB_INSTR',label: 'Instrução de Montagem', 					dept: 'MEP', term: 5, dep: ["TEST_INSTR", "ASSEMB_TOOLS"] },
		{ value: 'SMT', 		label: 'Programa para Máquina SMT', 				dept: 'MEP', term: 5, dep: ["PROTO_TEST", "GERBER", "BOM_DESC"] },
		{ value: 'INJECT', 		label: 'Ajuste/Programação Injetora', 				dept: 'MEP', term: 5, dep: ["DEVICE"] },
		{ value: 'QUALITY', 	label: 'Critérios de Qualidade', 					dept: 'MPR', term: 5, dep: ["ASSEMB_INSTR"], required: true },
		{ value: 'TEST', 		label: 'Testes de Verificação/Validação', 			dept: 'MPR', term: 5, dep: ["PROTO_SW"], required: true },
		{ value: 'GOLD', 		label: 'Golden Sample', 							dept: 'MPR', term: 5, dep: ["QUALITY"] },
//		{ value: 'PRODUCT_DOC', label: 'Documento de Produto', 						dept: 'MPR', term: 5, dep: ["TEST"], required: true },
		{ value: 'PRODUCT_SW',	label: 'Documento de Software',						dept: 'MPD', term: 5, dep: ["TEST"] },
		{ value: 'PRODUCT_FW',	label: 'Documento de Firmware', 					dept: 'MPD', term: 5, dep: ["TEST"] },
		{ value: 'ASSEMB_DOC',	label: 'Documento de Montagem/Teste', 				dept: 'MEP', term: 2, dep: ["TEST"], required: true },
		{ value: 'PRICE_TABLE',	label: 'Tabela de Preço', 							dept: 'COM', term: 5, dep: ["TEST","BOM_PRICE"], required: true },
		{ value: 'RELEASE_PLAN',label: 'Plano de Lançamento', 						dept: 'MPR', term: 5, dep: ["PRICE_TABLE"], required: true },
		{ value: 'PRODUCTION',	label: 'Produção', 									dept: 'OPR', term: 90,dep: ["TEST", "GOLD", "PRODUCT_SW", "PRODUCT_FW", "ASSEMB_DOC"], required: true },
		{ value: 'PILOT', 		label: 'Lote Piloto', 								dept: 'MEP', term: 5, dep: ["INJECT","ASSEMB_INSTR","SMT","TEST_INSTR","QUALITY","TEMPLATE", "TAG_SPEC", "PACKING_SPEC", "MANUAL", "PRODUCTION", "RELEASE_PLAN"], required: true },
		{ value: 'RELEASE',		label: 'Lançamento', 								dept: null,  term: 0, dep: ["PILOT", "HOMOLOG"], required: true }
	],

	REGULATIONS: [
		{ value: 'abnt', label: 'ABNT' },
		{ value: 'anatel', label: 'ANATEL' },
		{ value: 'inmetro', label: 'INMETRO' },
		{ value: 'anvisa', label: 'ANVISA' },
		{ value: 'other', label: 'Outro(s)' }
	],

	DEMAND_PERIODS: [
		{ value: 'year', label: 'por ano' },
		{ value: 'month', label: 'por mês' },
		{ value: 'day', label: 'por dia' },
		{ value: 'unique', label: 'uma vez' },
	],

	CURRENCIES: [
		{ value: 'BRL', label: 'R$' },
		{ value: 'USD', label: 'US$' },
		{ value: 'EUR', label: '€' },
	]
})

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
		{ value: 'ELETRIC_LAYOUT',label:'Esquema Elétrico/Layout', 					dept: 'MPD', term: 60, annex: true },
		{ value: 'BOM_DESC', 	label: 'BOM com P/N, Descrição', 					dept: 'MPD', term: 5,  required: true, annex: true },
		{ value: 'GERBER', 		label: 'Arquivo Gerber e Centroide', 				dept: 'MPD', term: 5,  annex: true },
		{ value: 'MECH_LAYOUT', label: 'Desenho de Partes Mecânicas', 				dept: 'MPR', term: 60, annex: true },
		{ value: 'FIRMWARE', 	label: 'Firmware', 									dept: 'MPD', term: 10, annex: true },
		{ value: 'BOM_SUBMIT',	label: 'Cadastro de BOM no Sistema',	            dept: 'MEP', term: 3, dep: ["BOM_DESC"], required: true, annex: false },
		{ value: 'CHECKLIST',	label: 'Checklist Produtivo',			            dept: 'MEP', term: 7, dep: ["ELETRIC_LAYOUT", "BOM_DESC", "GERBER", "MECH_LAYOUT"], required: true, annex: true },
		{ value: 'TEMPLATE', 	label: 'Estêncil/Templates', 						dept: 'OSC', term: 5, dep: ["GERBER", "CHECKLIST" ], annex: true },
		{ value: 'JIG', 		label: 'Confecção de Equipamentos e Jiga de Testes',dept: 'OPR', term: 10,dep: ["CHECKLIST"], required: true, annex: true },
		{ value: 'SMT', 		label: 'Programa para Máquina SMT', 				dept: 'MEP', term: 5, dep: ["GERBER", "BOM_SUBMIT", "TEMPLATE"], annex: false },
		{ value: 'TRYOUT', 		label: 'Try Out Injetora',           				dept: 'OPR', term: 5, dep: ["BOM_SUBMIT", "CHECKLIST"], annex: false },
		{ value: 'GOLDEN', 		label: 'Golden Sample', 							dept: 'MPR', term: 5, dep: ["CHECKLIST"], annex: false },
		{ value: 'PRODUCTION',	label: 'Compra do Primeiro Lote de Produção',		dept: 'OSC', term: 90,dep: ["BOM_SUBMIT", "CHECKLIST"], required: true, annex: true },
		{ value: 'ASSEMBLY',    label: 'Instrução de Montagem', 					dept: 'MEP', term: 5, dep: ["CHECKLIST", "TEMPLATE", "GOLDEN", "PRODUCTION"], required: true, annex: true },
		{ value: 'PILOT', 		label: 'Lote Piloto', 								dept: 'MEP', term: 5, dep: ["ASSEMBLY", "PRODUCTION"], required: true, annex: true },
		/*{ 
			value: 'DEV', 
			label: 'Desenvolvimento', 
			dept: null, term: 0, 
			dep: ["DATE", "FIN_EST", "RMA"], 
			required: true, annex: true 
		}*/
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
		finalApproval: 'Aprovação Final',
		validation: 'Validação'
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
		{ value: 'SPECS_HW', 	label:'Especificação Técnica - Funcionalidade HW',  dept: 'MPR', term: 1, annex: true },
		{ value: 'SPECS_SW', 	label:'Especificação Técnica - Funcionalidade de SW',dept:'MPR', term: 1, annex: true },
		{ value: 'MECH_SPEC', 	label: 'Especificação Mecânica/Dimensional', 		dept: 'MPR', term: 1, annex: true },
		{ value: 'ELETRIC_LAYOUT',label:'Esquema Elétrico/Layout', 					dept: 'MPD', term: 60,dep: ["SPECS_HW"], annex: true },
		{ value: 'BOM_DESC', 	label: 'BOM com P/N, Descrição', 					dept: 'MPD', term: 5, dep: ["ELETRIC_LAYOUT"], required: true, annex: true },
		{ value: 'GERBER', 		label: 'Arquivo Gerber e Centroide', 				dept: 'MPD', term: 5, dep: ["ELETRIC_LAYOUT"], annex: true },
		{ value: 'MECH_LAYOUT', label: 'Desenho de Partes Mecânicas', 				dept: 'MPR', term: 60,dep: ["MECH_SPEC"], annex: true },
		{ value: 'FIRMWARE', 	label: 'Firmware', 									dept: 'MPD', term: 10,dep: ["GERBER"], annex: true },
		{ value: 'BOM_PRICE', 	label: 'Cotação/Compra da BOM de Protótipo', 		dept: 'OSC', term: 20,dep: ["ELETRIC_LAYOUT", "BOM_DESC"], required: true, annex: true },
		{ value: 'PROTO_ASSEMB',label: 'Montagem de Protótipo', 					dept: 'MPD', term: 10,dep: ["FIRMWARE","BOM_PRICE"], annex: false },
		{ value: 'PROTO_SW', 	label: 'Protótipo de Software', 					dept: 'MPD', term:100,dep: ["SPECS_SW"], annex: true },
		{ value: 'PROTO_VERIF',	label: 'Testes de Verificação de Protótipo',        dept: 'MPD', term: 15,dep: ["PROTO_ASSEMB"], required: true, annex: true },
		{ value: 'PROTO_VALID',	label: 'Testes de Validação de Protótipo',          dept: 'MPR', term: 15,dep: ["PROTO_VERIF"], required: true, annex: true },
		{ value: 'BOM_SUBMIT',	label: 'Cadastro de BOM no Sistema',	            dept: 'MEP', term: 3, dep: ["PROTO_VALID"], required: true, annex: false },
		{ value: 'CHECKLIST',	label: 'Checklist Produtivo',			            dept: 'MEP', term: 7, dep: ["PROTO_VALID"], required: true, annex: true },
		{ value: 'DEVICE', 		label: 'Dispositivos/Moldes - Projeto e Compra',	dept: 'MPR', term: 90,dep: ["MECH_LAYOUT", "CHECKLIST"], annex: true },
		{ value: 'TEMPLATE', 	label: 'Estêncil/Templates', 						dept: 'OSC', term: 5, dep: ["CHECKLIST" ], annex: true },
		{ value: 'DATASHEET', 	label: 'Datasheet do Produto', 				 		dept: 'MPR', term: 5, dep: ["PROTO_VALID"], required: true, annex: true },
		{ value: 'SPEC_TAG', 	label: 'Desenho/Especificação de Etiquetas', 		dept: 'MPR', term: 5, dep: ["DATASHEET"], required: true, annex: true },
		{ value: 'SPEC_PACKING',label: 'Desenho/Especificação Embalagem',           dept: 'MPR', term: 10,dep: ["DATASHEET"], required: true, annex: true },
		{ value: 'MANUAL', 		label: 'Manual para o Produto', 					dept: 'MPR', term: 10,dep: ["DATASHEET"], required: true, annex: true },
		{ value: 'HOMOLOG', 	label: 'Homologação', 			        			dept: 'MPR', term:150,dep: ["DATASHEET"], annex: true },
		{ value: 'EQUIPMENT',   label:'Definição de equipamentos e Processo de Teste',dept:'MPD',term:150,dep: ["PROTO_VALID"], required: true, annex: true },
		{ value: 'JIG', 		label: 'Confecção de Equipamentos e Jiga de Testes',dept: 'OPR', term: 10,dep: ["EQUIPMENT"], required: true, annex: true },
		{ value: 'SMT', 		label: 'Programa para Máquina SMT', 				dept: 'MEP', term: 5, dep: ["GERBER", "BOM_SUBMIT", "TEMPLATE"], annex: false },
		{ value: 'TRYOUT', 		label: 'Try Out Injetora',           				dept: 'OPR', term: 5, dep: ["BOM_SUBMIT", "DEVICE"], annex: false },
		{ value: 'GOLDEN', 		label: 'Golden Sample', 							dept: 'MPR', term: 5, dep: ["PROTO_VALID"], annex: false },
		{ value: 'DOCUMENT_SW',	label: 'Documento de Software',						dept: 'MPD', term: 5, dep: ["PROTO_SW", "PROTO_VALID"], annex: true },
		{ value: 'DOCUMENT_FW',	label: 'Documento de Firmware', 					dept: 'MPD', term: 5, dep: ["FIRMWARE", "PROTO_VALID"], annex: true },
		{ value: 'PRICE_TABLE',	label: 'Tabela de Preço', 							dept: 'COM', term: 5, dep: ["PROTO_VALID"], required: true, annex: true },
		{ value: 'RELEASE_PLAN',label: 'Plano de Lançamento', 						dept: 'MPR', term: 5, dep: ["PROTO_VALID","PRICE_TABLE"], required: false, annex: false },
		{ value: 'PRODUCTION',	label: 'Compra do Primeiro Lote de Produção',		dept: 'OSC', term: 90,dep: ["BOM_SUBMIT", "CHECKLIST"], required: true, annex: true },
		{ value: 'ASSEMBLY',    label: 'Instrução de Montagem', 					dept: 'MEP', term: 5, dep: ["JIG", "CHECKLIST", "GOLDEN", "PRODUCTION"], required: true, annex: true },
		{ value: 'PILOT', 		label: 'Lote Piloto', 								dept: 'MEP', term: 5, dep: ["ASSEMBLY", "PRODUCTION"], required: true, annex: true },
		{ value: 'RELEASE',		label: 'Data de Lançamento', 						dept: null,  term: 0, dep: ["MECH_LAYOUT", "SPEC_TAG", "SPEC_PACKING", "SMT", "DOCUMENT_FW", "DOCUMENT_SW", "RELEASE_PLAN", "PILOT"], required: true, annex: false }
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

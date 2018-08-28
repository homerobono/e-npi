import User from "./user.model";
import { Globals } from 'config'

class Npi {
    id: String;
    number: Number;
    complexity: Number;
    client: String;
    name: String;
    requester: User;
    stage: Number;
    status: String;
    created: Date;
    createdString: String;
    npiRef: Number;
    entry: String;
    entryLabel: String;
    price: Number;
    cost: Number;
    investment: Number;
    projectCost: {
        cost: Number;
        annex: String
    };
    inStockDate: Date | { fixed: Date, offset: Number };
    oemActivities: Array<
        {
            date: Date,
            comment: String,
            annex: String
        }>;
    critical: Array<{
            status: String,
            dept: String,
            comment: String,
            signature: String
        }>;
    constructor(npiModel: any | null) {
        
        this.id = null
        this.number = null
        this.name = null
        this.requester = null
        this.status = null
        this.created = null
        this.createdString = null
        this.npiRef = null
        this.entry = null
        this.entry = null
        this.price = null
        this.cost = null
        this.projectCost = null
        this.investment = null
        this.inStockDate = null
        this.oemActivities = null;
        this.critical = null

        if (npiModel) {
            if (npiModel._id) this.id = npiModel._id
            if (npiModel.id) this.id = npiModel.id
            if (npiModel.client != null) this.client = npiModel.client
            if (npiModel.complexity != null) this.complexity = npiModel.complexity
            if (npiModel.number != null) this.number = npiModel.number
            if (npiModel.name != null) this.name = npiModel.name
            if (npiModel.requester != null) this.requester = npiModel.requester
            if (npiModel.stage != null) {
                this.stage = npiModel.stage
                this.status = Globals.STATUS[npiModel.status]
            }
            if (npiModel.created != null) {
                this.created = new Date(npiModel.created)
                this.createdString = this.created.toLocaleDateString('pt-br')
            }
            if (npiModel.npiRef != null) this.npiRef = npiModel.npiRef
            if (npiModel.entry != null) this.entry = npiModel.entry
            if (npiModel.__t != null) this.entry = npiModel.__t
            if (npiModel.price != null) this.price = npiModel.price
            if (npiModel.cost != null) this.cost = npiModel.cost
            if (npiModel.investment != null) this.investment = npiModel.investment
            if (npiModel.projectCost != null) this.projectCost = npiModel.projectCost
            if (npiModel.inStockDate != null) this.inStockDate =
                (typeof npiModel.inStockDate === 'string' ||
                    npiModel.inStockDate instanceof String) ?
                    new Date(npiModel.inStockDate) :
                    this.inStockDate = npiModel.inStockDate
            if (npiModel.oemActivities != null) {
                this.oemActivities = npiModel.oemActivities
                for (var i = 0; i < npiModel.oemActivities.length; i++) {
                    this.oemActivities[i].date = new Date(npiModel.oemActivities[i].date)
                }
            }
            if (npiModel.critical != null) this.critical = npiModel.critical

            switch (this.entry) {
                case ('pixel'):
                    this.entryLabel = 'Pixel'
                    break
                case ('oem'):
                    this.entryLabel = 'O&M'
                    break
                case ('internal'):
                    this.entryLabel = 'Interno'
                    break
                case ('custom'):
                    this.entryLabel = 'Customização'
                    break
                default:
                    this.entryLabel = null
            }
            switch (this.stage) {
                case (0):
                    this.status = 'Cancelado'
                    break
                case (1):
                    this.status = 'Rascunho'
                    break
                case (2):
                    this.status = 'Análise Crítica'
                    break
                case (3):
                    this.status = 'Desenvolvimento'
                    break
                case (4):
                    this.status = 'Concluído'
                    break
                default:
                    this.status = 'Rascunho'
            }
        } else {
            this.id = null
            this.number = null
            this.name = null
            this.requester = null
            this.status = null
            this.created = null
            this.createdString = null
            this.npiRef = null
            this.entry = null
            this.entry = null
            this.price = null
            this.cost = null
            this.projectCost = null
            this.investment = null
            this.inStockDate = null
            this.oemActivities = null;
        }
    }
}

export default Npi;
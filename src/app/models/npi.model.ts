import User from "./user.model";
import { Globals } from 'config'

class Npi {
    id: String;
    number: Number;
    complexity: Number;
    npiRef: Npi;
    client: String;
    name: String;
    requester: User;
    stage: Number;
    created: Date;
    createdString: String;
    entry: String;
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
            _id: String,
            dept: String,
            date: Date,
            comment: String,
            annex: String
        }>;
    critical: Array<
        {
            _id: String,
            status: String,
            dept: String,
            comment: String,
            signature: {
                user: any,
                date: Date
            }
        }>;
    clientApproval: {
        approval: String,
        comment: String
    };
    constructor(npiModel: any | null) {
        /*
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
*/
        if (npiModel) {
            if (npiModel._id) this.id = npiModel._id
            if (npiModel.id) this.id = npiModel.id
            if (npiModel.client != null) this.client = npiModel.client
            if (npiModel.complexity != null) this.complexity = npiModel.complexity
            if (npiModel.number != null) this.number = npiModel.number
            if (npiModel.name != null) this.name = npiModel.name
            if (npiModel.requester != null) this.requester = npiModel.requester
            if (npiModel.stage != null) this.stage = npiModel.stage
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
            if (npiModel.critical != null) {
                this.critical = npiModel.critical
                for (let i = 0; i < npiModel.critical; i++) {
                    this.critical[i].signature.date = new Date(npiModel.critical[i].signature.date)
                }
            }
            if (npiModel.clientApproval != null) this.clientApproval = npiModel.clientApproval
            
        } else {/*
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
            this.oemActivities = null;*/
        }
    }

    public isCriticallyAnalised(): Boolean {
        if (this.critical) {
            return this.critical.some(
                (analisys) => {
                    return analisys.status != null
                }
            )
        }
    }

    public isCriticallyDisapproved(): Boolean {
        if (this.critical) {
            return this.critical.some(
                (analisys) => {
                    return analisys.status == 'deny'
                }
            )
        }
    }

    public isCriticallyApproved(): Boolean {
        if (this.critical) {
            return this.critical.every(
                (analisys) => {
                    return analisys.status == 'accept'
                }
            )
        }
    }
}

export default Npi;
import User from "./user.model";
import { Globals } from 'config'

class Npi {
    id: String;
    version: Number;
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
    description: String;
    resources: {
        description,
        annex
    };
    regulations: Array<String>;
    norms: {
        description,
        annex
    };
    demand: {
        amount: Number,
        period: String,
    };
    price: Number;
    cost: Number;
    investment: Number;
    projectCost: {
        cost: Number;
        annex: String
    };
    inStockDate: any;
    fiscals: String;
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
    activities: Array<{
        _id: String,
        date: Date,
        dept: String,
        comment: String,
        registry: String,
    }>;

    constructor(npiModel: any | null) {

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

            if (npiModel.description != null) this.description = npiModel.description
            if (npiModel.resources != null) this.resources = npiModel.resources
            if (npiModel.regulations != null) this.regulations = npiModel.regulations
            if (npiModel.norms != null) this.norms = npiModel.norms
            if (npiModel.demand != null) this.demand = npiModel.demand

            if (npiModel.price != null) this.price = npiModel.price
            if (npiModel.cost != null) this.cost = npiModel.cost
            if (npiModel.investment != null) this.investment = npiModel.investment
            if (npiModel.projectCost != null) this.projectCost = npiModel.projectCost
            if (npiModel.inStockDate != null) this.inStockDate =
                (typeof npiModel.inStockDate === 'string' ||
                    npiModel.inStockDate instanceof String) ?
                    new Date(npiModel.inStockDate) :
                    this.inStockDate = npiModel.inStockDate
            if (npiModel.fiscals != null) this.fiscals = npiModel.fiscals
            if (npiModel.oemActivities != null) {
                this.oemActivities = npiModel.oemActivities
                this.oemActivities.forEach(activity => {
                    activity.date = new Date(activity.date)
                });
            }
            if (npiModel.critical != null) {
                this.critical = npiModel.critical
                this.critical.forEach(critical => {
                    if (critical.signature && critical.signature.date)
                        critical.signature.date = new Date(critical.signature.date);
                });
            }
            if (npiModel.clientApproval != null) this.clientApproval = npiModel.clientApproval
            if (npiModel.activities != null) {
                this.activities = npiModel.activities
                npiModel.activities.forEach(activity =>
                    activity = new Date(activity.date));
            }
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
import User from "./user.model";
import { Globals } from 'config'
import { UtilService } from "../services/util.service";
import { FileDescriptor } from "./file-descriptor";
import { max } from "rxjs/operators";

const utils = new UtilService()

var dateOptions = {
    day: 'numeric',
    month: 'numeric',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
}

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
    updated: Date;
    updatedString: String;
    entry: String;
    designThinking: {
        apply: Boolean,
        annex: [FileDescriptor]
    };
    description: {
        description: String,
        annex: [FileDescriptor]
    };
    resources: {
        description: String,
        annex: [FileDescriptor]
    };
    regulations: {
        standard: Object,
        additional: String,
        description: String,
        annex: [FileDescriptor]
    };
    demand: {
        amount: Number,
        period: String,
    };
    price: {
        value: Number;
        currency: String;
        annex: String
    };
    cost: {
        value: Number;
        currency: String;
        annex: String
    };
    investment: {
        value: Number;
        currency: String;
        annex: [FileDescriptor]
    };
    projectCost: {
        value: Number;
        currency: String;
        annex: [FileDescriptor]
    };
    inStockDate: any;
    fiscals: String;
    oemActivities: Array<{
        _id: String,
        activity: String,
        term: Number,
        dept: String,
        responsible: any,
        comment: String,
        annex: [FileDescriptor],
        registry: String,
        closed: Boolean,
        signature: {
            user: any,
            date: Date,
        },
        apply: Boolean
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
    finalApproval: {
        _id: String,
        status: String,
        comment: String,
        signature: {
            user: any,
            date: Date
        }
    };
    clientApproval: {
        approval: String,
        comment: String,
        annex: [FileDescriptor],
        signature: {
            user: any,
            date: Date
        }
    };
    activities: Array<{
        _id: String,
        activity: String,
        term: Number,
        dept: String,
        responsible: any,
        comment: String,
        annex: [FileDescriptor],
        registry: String,
        closed: Boolean,
        signature: {
            user: any,
            date: Date,
        },
        apply: Boolean
    }>;
    requests: Array<{
        _id: String,
        class: String,
        responsible: any,
        comment: String,
        closed: Boolean,
        signature: {
            user: any,
            date: Date,
        },
        analysis: Array<{
            _id: String,
            status: String,
            dept: String,
            comment: String,
            signature: {
                user: any,
                date: Date
            }
        }>;
    }>;
    validation: {
        final: String
        signature: {
            user: any,
            date: Date
        }
        status: Boolean
    }

    constructor(npiModel?: any | null) {

        if (npiModel) {
            if (npiModel._id) this.id = npiModel._id
            if (npiModel.id) this.id = npiModel.id
            if (npiModel.version != null) this.version = npiModel.version
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
            if (npiModel.updated != null) {
                this.updated = new Date(npiModel.updated)
                this.updatedString = utils.getTimeDifference(new Date(), this.updated)
            }
            if (npiModel.npiRef != null) this.npiRef = npiModel.npiRef
            if (npiModel.entry != null) this.entry = npiModel.entry
            if (npiModel.__t != null) this.entry = npiModel.__t

            if (npiModel.designThinking != null) this.designThinking = npiModel.designThinking
            if (npiModel.description != null) this.description = npiModel.description
            if (npiModel.resources != null) this.resources = npiModel.resources
            if (npiModel.regulations != null) this.regulations = npiModel.regulations
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
                    if (activity.signature && activity.signature.date)
                        activity.signature.date = new Date(activity.signature.date);
                });
            }
            if (npiModel.critical != null) {
                this.critical = npiModel.critical
                this.critical.forEach(critical => {
                    if (critical.signature && critical.signature.date)
                        critical.signature.date = new Date(critical.signature.date);
                });
            }
            if (npiModel.finalApproval != null) {
                this.finalApproval = npiModel.finalApproval
                if (this.finalApproval.signature && this.finalApproval.signature.date)
                    this.finalApproval.signature.date = new Date(this.finalApproval.signature.date);
            }
            if (npiModel.clientApproval != null) this.clientApproval = npiModel.clientApproval
            if (npiModel.activities != null) {
                this.activities = npiModel.activities
                this.activities.forEach(activity => {
                    if (activity.signature && activity.signature.date)
                        activity.signature.date = new Date(activity.signature.date);
                });
            }
            if (npiModel.requests != null) this.requests = npiModel.requests
            if (npiModel.validation != null) this.validation = npiModel.validation
        }
    }
    public amITheOwner(userId): Boolean {
        return this.requester._id == userId
      }

    public isCriticallyTouched(): Boolean {
        if (this.critical) {
            return this.critical.some(
                (analysis) => analysis.status != null
            )
        }
        return false
    }

    public isCriticallyAnalysed(): Boolean {
        if (this.critical) {
            return this.critical.every(
                analysis => analysis.status != null
            ) || this.finalApproval.status != null
        }
        return false
    }

    public isCriticallyDisapproved(): Boolean {
        if (this.critical) {
            return this.critical.some(
                (analysis) => analysis.status == 'deny'
            ) && this.critical.every(
                analysis => analysis.status != null
            )
        }
        return false
    }

    public hasCriticalApproval(): Boolean {
        if (this.critical) {
            return this.critical.some(
                analysis => analysis.status == 'accept'
            )
        }
        return false
    }

    public hasCriticalDisapproval(): Boolean {
        if (this.critical) {
            return this.critical.some(
                (analysis) => analysis.status == 'deny'
            )
        }
        return false
    }

    public isCriticallyApproved(): Boolean {
        if (this.critical) {
            return this.critical.every(
                analysis => analysis.status == 'accept'
            ) || this.finalApproval.status == 'accept'
        }
        return false
    }

    public isApproved(): Boolean {
        if (this.critical) {
            if (this.isCriticallyApproved())
                if (this.entry == 'oem')
                    return (this.clientApproval && this.clientApproval.approval == 'accept')
                else
                    return true
        }
        return false
    }

    public isOemComplete(): Boolean {
        if (this.entry != 'oem') return false
        return this.oemActivities.every(
            activity => activity.closed == true
        )
    }

    public isComplete(): Boolean {
        if (this.activities) {
            return this.activities.every(
                activity => activity.apply == false || activity.closed == true
            )
        }
        return false
    }

    public isRequestRegistered(className: String) : Boolean {
    return this.requests.find(request => request.class == className) != null
    }

    public isRequestOpen(className: String) : Boolean {
        let request = this.requests.find(request => request.class == className)
        if(request)
            return !Boolean(request.closed)
        return false
    }

    public getCriticalApprovalDate(): Date {
        if (this.isCriticallyApproved) {
            if (this.finalApproval && this.finalApproval.status == 'accept') return this.finalApproval.signature.date
            var lastAnalysisDate = this.critical[0].signature.date
            this.critical.forEach(analysis => {
                lastAnalysisDate = lastAnalysisDate < analysis.signature.date ? analysis.signature.date : lastAnalysisDate
            })
            return lastAnalysisDate
        } return null
    }

    public getApprovalDate(): Date {
        if (this.entry == 'oem')
            return this.clientApproval.signature.date
        else return this.getCriticalApprovalDate()
    }

    public getDependentActivities(activity): Array<any> {
        let deps = []
        Globals.MACRO_STAGES.forEach(act => {
            if (act.dep && act.dep.includes(activity)) {
                let activityModel = this.activities.find(a => a.activity == act.value)
                if (activityModel && !activityModel.apply)
                    deps = deps.concat(this.getDependentActivities(act))
                else
                    deps.push(act.value)
            }
        })
        return deps
    }

    getInStockDate(): Date {
        if (this.entry == 'oem') {
            if (this.inStockDate.fixed)
                return new Date(this.inStockDate.fixed)
            else if (this.inStockDate.offset) {
                return new Date(
                    new Date(this.getApprovalDate()).valueOf() + this.inStockDate.offset * 24 * 3600 * 1000
                )
            }
        }
        else
            return new Date(this.inStockDate)
    }
}

export default Npi;
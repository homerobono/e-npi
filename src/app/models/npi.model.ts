import User from "./user.model";

class Npi {
    id: String;
    number: Number;
    name: String;
    requester: User;
    status: String;
    created : Date;
    createdString : String;
    npiRef : Number;
    entry : String;
    entryLabel : String;
    price : Number;
    cost : Number;
    investment : Number;
    inStockDate : Date | { fixed: Date, offset: Number };

    constructor( npiModel : any | null) {
        if (npiModel) {
            if(npiModel._id) this.id = npiModel._id
            if(npiModel.id) this.id = npiModel.id
            if(npiModel.number != null) this.number = npiModel.number
            if(npiModel.name != null) this.name = npiModel.name
            if(npiModel.requester != null) this.requester = npiModel.requester
            if(npiModel.status != null) this.status = npiModel.status
            if(npiModel.created != null) { this.created = new Date(npiModel.created)
            this.createdString = this.created.toLocaleDateString('pt-br') }
            if(npiModel.npiRef != null) this.npiRef = npiModel.npiRef
            if(npiModel.entry != null) this.entry = npiModel.entry
            if(npiModel.__t != null) this.entry = npiModel.__t
            if(npiModel.price != null) this.price = npiModel.price
            if(npiModel.cost != null) this.cost = npiModel.cost
            if(npiModel.investment != null) this.investment = npiModel.investment
            if(npiModel.inStockDate != null) this.inStockDate = 
                (typeof npiModel.inStockDate === 'string' ||
                npiModel.inStockDate instanceof String)?
                    new Date(npiModel.inStockDate) :
                    this.inStockDate = npiModel.inStockDate
            
            switch(this.entry){
                case('pixel'):
                    this.entryLabel = 'Pixel'
                    break
                case('oem'):
                    this.entryLabel = 'O&M'
                    break
                case('internal'):
                    this.entryLabel = 'Interno'
                    break
                case('custom'):
                    this.entryLabel = 'Customização'
                    break
                default :
                    this.entryLabel = null
            }
            console.log(npiModel.requester)
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
            this.investment = null
            this.inStockDate = null
        }
    }
}

export default Npi;
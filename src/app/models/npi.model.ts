class Npi {
    id: String;
    number: Number;
    name: String;
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
            if(npiModel.number) this.number = npiModel.number
            if(npiModel.name) this.name = npiModel.name
            if(npiModel.status) this.status = npiModel.status
            if(npiModel.created) { this.created = new Date(npiModel.created)
            this.createdString = this.created.toLocaleDateString('pt-br') }
            if(npiModel.npiRef) this.npiRef = npiModel.npiRef
            if(npiModel.entry) this.entry = npiModel.entry
            if(npiModel.__t) this.entry = npiModel.__t
            if(npiModel.price) this.price = npiModel.price
            if(npiModel.cost) this.cost = npiModel.cost
            if(npiModel.investment) this.investment = npiModel.investment
            if(npiModel.inStockDate) this.inStockDate = 
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
            console.log(this.inStockDate)

        }
    }
}

export default Npi;
class Npi {
    _id: String;
    number: Number;
    name: String;
    status: String;
    created : Date;
    createdString : String;
    entry : String;
    constructor( npiModel : any | null) {
        this._id = ''
        this.number = 0;
        this.name = '';
        this.status = 'Análise Crítica';
        this.created = new Date()
        this.createdString = new Date(this.created).toLocaleString();
        
        if (npiModel) {
            for (let prop in npiModel) {
                if (this[prop]!=null){
                    this[prop] = npiModel[prop]
                }
            }
            switch(npiModel.__t) {
                case 'pixel' :
                    this.entry = 'Pixel'
                    break
                case 'internal' :
                    this.entry = 'Interno'
                    break
                case 'oem' :
                    this.entry = 'O&M'
                    break
                case 'custom' :
                    this.entry = 'Customização'
                    break
                default :
                    this.entry = null
            }
        }
    }
    
}

export default Npi;
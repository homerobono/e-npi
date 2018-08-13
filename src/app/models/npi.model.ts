class Npi {
    _id: String;
    _t;
    __t;
    number: Number;
    name: String;
    status: String;
    created : Date;
    createdString : String;
    entry : String;
    constructor() {
        this.number = 0;
        this.name = '';
        this.status = 'Análise Crítica';
        this.created = new Date()
        this.createdString = new Date(this.created).toLocaleString();
    }   
}

export default Npi;
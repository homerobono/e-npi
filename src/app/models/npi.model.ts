class Npi {
    _id: String;
    number: Number;
    name: String;
    status: String;
    created : Date;
    createdString : String;
    constructor() {
        this.number = 0;
        this.name = '';
        this.status = 'Análise Crítica';
        this.created = new Date()
        this.createdString = new Date(this.created).toLocaleString();
    }   
}

export default Npi;
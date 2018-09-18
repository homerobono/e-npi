class FileElement {
    name: string;
    type: string;
    date: Date;
    rights: string;

    constructor(data){
        this.name = data.name
        this.type = data.type
        this.date = data.date
        this.rights = data.rights
    }

    public isFolder(): Boolean { 
        return this.type === 'dir'
    }
}

export default FileElement

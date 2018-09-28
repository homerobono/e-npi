class FileElement {
    name: string;
    type: string;
    date: Date;
    rights: string;
    size: number;

    constructor(data){
        this.name = data.name
        this.type = data.type
        this.date = data.date
        this.rights = data.rights
        this.size = data.size
    }

    public isFolder(): Boolean { 
        return this.type === 'dir'
    }

    get sizeString(): String {
        let sS = this.size > 1024 * 1024 *1024 ? (this.size/1024/1024/1024).toFixed(1) + ' GB'
        : this.size > 1024 * 1024 ? (this.size/1024/1024).toFixed(1) + ' MB'
        : this.size > 1024 ? (this.size/1024).toFixed(1) + ' kB'
        : this.size.toString() + ' B'
        return sS
    }
}

export default FileElement

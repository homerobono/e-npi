import { FileLikeObject } from "ng2-file-upload";

export class FileDescriptor {
    name: String
    path: String
    lastModified: Date

    constructor(path, file: FileLikeObject){
        this.path = path
        this.name = file.name
        this.lastModified = file.lastModifiedDate
    }
}

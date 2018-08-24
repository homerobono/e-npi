class User {
    _id: String;
    username: String;
    email: String;
    password: String;
    firstName: String;
    lastName: String;
    department: String;
    phone: String;
    level: Number;
    created: Date;
    createdString: String;
    status: String;
    lastUpdate: Date;
    resetToken: String;
    resetExpires: Date;
    notify: Boolean

    constructor() {
        this.firstName = "";
        this.lastName = "";
        this.email = "";
        this.password = "";
        this.phone = "";
        this.department = "";
        this.level = 0;
        this.notify = false;
    }   
}

export default User;
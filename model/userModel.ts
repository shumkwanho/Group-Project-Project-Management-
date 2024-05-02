export default class UserModel {
    private user: any
    constructor() {
        this.user = {name: "james"}
    }


    async getUser() {
        await pgClient.query("select * from users;");
    }

    async getUsername(id: number ) {
        await pgClient.query("select * from users where id = $1;", [id]);
    }
    async insert() {
        await pgClient.query("select * from users;");
    }
}



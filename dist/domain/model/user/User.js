export class User {
    id;
    name;
    email;
    constructor(id, name, email) {
        this.id = id;
        this.name = name;
        this.email = email;
    }
    static create(id, name, email) {
        if (!User.isValidName(name)) {
            throw new Error("名前は1文字以上20文字以下でなければなりません");
        }
        if (!User.isValidEmail(email)) {
            throw new Error("メールアドレスは有効でなければなりません");
        }
        return new User(id, name, email);
    }
    /**
     * ユーザーの名前を変更する
     * @param name ユーザーの名前
     * @returns ユーザー
     */
    changeName(name) {
        if (!User.isValidName(name)) {
            throw new Error("名前は1文字以上20文字以下でなければなりません");
        }
        return new User(this.id, name, this.email);
    }
    /**
     * ユーザーのメールアドレスを変更する
     * @param email ユーザーのメールアドレス
     * @returns ユーザー
     */
    changeEmail(email) {
        if (!User.isValidEmail(email)) {
            throw new Error("メールアドレスは有効でなければなりません");
        }
        return new User(this.id, this.name, email);
    }
    /**
     * ユーザーの名前が有効かどうかを返す
     * @param name ユーザーの名前
     * @returns ユーザーの名前が有効かどうか
     */
    static isValidName(name) {
        return name.length >= 1 && name.length <= 20;
    }
    /**
     * ユーザーのメールアドレスが有効かどうかを返す
     * @param email ユーザーのメールアドレス
     * @returns ユーザーのメールアドレスが有効かどうか
     */
    static isValidEmail(email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    }
}

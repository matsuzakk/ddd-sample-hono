export class User {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
  ) {}

  public static create(id: string, name: string, email: string): User {
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
  public changeName(name: string): User {
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
  public changeEmail(email: string): User {
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
  private static isValidName(name: string): boolean {
    return name.length >= 1 && name.length <= 20;
  }

  /**
   * ユーザーのメールアドレスが有効かどうかを返す
   * @param email ユーザーのメールアドレス
   * @returns ユーザーのメールアドレスが有効かどうか
   */
  private static isValidEmail(email: string): boolean {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  }
}

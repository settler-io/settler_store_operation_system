import { User } from "../../entity";
import type { IUserRepository } from "../../repository";
import { PasswordService } from "../user";

export class UserService {
  readonly #userRepository: IUserRepository;
  readonly #passwordService: PasswordService;

  constructor(userRepository: IUserRepository, passwordService: PasswordService) {
    this.#userRepository = userRepository;
    this.#passwordService = passwordService;
  }

  /**
   * Email登録でユーザを新規作成する処理
   */
  async registerNewUserWithEmailAndPassword(data: { email: string; password: string }): Promise<User> {
    const user = User.create({ email: data.email });
    user.updatePassword(await this.#passwordService.hashPassword(data.password, user.passwordSalt));
    await this.#userRepository.add(user);
    return user;
  }

  /**
   * Emailを変更する処理
   */
  async updateEmail(userId: User["id"], newEmail: string) {
    const user = await this.#userRepository.find(userId);
    user.updateEmail(newEmail);

    if (!user.isEmailVerified) {
      user.updateStatusToEmailVerified();
    }
    await this.#userRepository.save(user);
  }

  /**
   * パスワードを変更する処理
   */
  async updatePassword(userId: User["id"], newPassword: string) {
    const user = await this.#userRepository.find(userId);
    user.updatePassword(await this.#passwordService.hashPassword(newPassword, user.passwordSalt));
    await this.#userRepository.save(user);
  }

  /**
   * プロフィール画像を変更する処理
   */
  async updateImageUrl(userId: User["id"], imageUrl: string) {
    const user = await this.#userRepository.find(userId);
    user.updateImageUrl(imageUrl);
    await this.#userRepository.save(user);
  }

  /**
   * 公開プロフィールを変更する処理
   */
  async updateProfile(userId: User["id"], data: { nickname: string; profile: string }) {
    const user = await this.#userRepository.find(userId);
    user.updateProfile(data);
    await this.#userRepository.save(user);
  }

  /**
   * ユーザステータスをEmail認証済みに変更する処理
   */
  async updateStatusToEmailVerified(userId: User["id"]) {
    const user = await this.#userRepository.find(userId);
    user.updateStatusToEmailVerified();
    await this.#userRepository.save(user);
  }
}

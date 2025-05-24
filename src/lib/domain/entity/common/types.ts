/**
 * 各domainにおけるEntityの共通した仕様
 * RepositoryではEntityの型をインターフェイスとして要求する設計にしている
 */
export interface Entity {
  // 全てのテーブルはidカラムを持つようにしている
  id: string;

  // 全てのテーブルはversionカラムを持つようにしている
  // versionカラムは更新時の並行トランザクションの排他制御をするために使っている
  version: number;

  // Entityの内部データに変更がある場合は、このメソッドで変更内容を全て取得できる
  getChanges(): any;
}

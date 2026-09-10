declare module "sql.js" {
  export interface Database {
    run(sql: string, params?: any[]): Database;
    exec(sql: string): { columns: string[]; values: any[][] }[];
    export(): Uint8Array;
    close(): void;
  }

  export default function initSqlJs(config?: any): Promise<{
    Database: new (data?: ArrayBuffer | Uint8Array) => Database;
  }>;
}

import { DatabaseService } from 'src/database/database.service';
export declare class AuthService {
    private readonly dbService;
    constructor(dbService: DatabaseService);
    getCustomToken(matricula: any): import("rxjs").Observable<{
        token: string;
        message: string;
    }>;
}

import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { BotService } from './bot.service';
export declare class BotController {
    private readonly dbService;
    private readonly configService;
    private readonly botService;
    constructor(dbService: DatabaseService, configService: ConfigService, botService: BotService);
    scheduleEveryone(): void;
    scheduleForStudent(params: any): void;
}

import { Controller, Get, Param } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { StudentWrapper } from 'src/shared/student-wrapper.interface';
import { BotService } from './bot.service';

@Controller('bot')
export class BotController {

    constructor(
        private readonly dbService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly botService: BotService,
    ) { }

    @Get('schedule')
    scheduleEveryone() {
        this.dbService.getStudentsToSchedule(parseInt(this.configService.get<string>('LIMIT_USERS'), 10))
            .subscribe((students: StudentWrapper[]) => {
                for (const student of students) {
                    this.botService.prepareScheduleForStudent(student);
                }
            })
    }

    @Get('schedule/:matricula')
    scheduleForStudent(@Param() params){
        // TODO: Talvez essa rota deveria pedir o password tbm
        return this.botService.scheduleForStudent(params.matricula);
    }
}

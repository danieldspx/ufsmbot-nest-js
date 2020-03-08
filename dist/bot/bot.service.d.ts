import { DatabaseService } from 'src/database/database.service';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { StudentWrapper } from 'src/shared/student-wrapper.interface';
import { UtilService } from 'src/shared/util/util.service';
export declare class BotService {
    private readonly dbService;
    private readonly restaurantService;
    private readonly utilService;
    constructor(dbService: DatabaseService, restaurantService: RestaurantService, utilService: UtilService);
    scheduleForStudent(matricula: string): void;
    prepareScheduleForStudent(student: StudentWrapper, daysException?: any[]): void;
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UtilService } from 'src/shared/util/util.service';
import { DatabaseService } from './database.service';

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [UtilService, DatabaseService],
    exports: [DatabaseService]
})
export class DatabaseModule {}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UtilService } from 'src/shared/util/util.service';

@Module({
    imports: [ConfigModule.forRoot()],
    providers: [UtilService],
    exports: [UtilService]
})
export class DatabaseModule {}

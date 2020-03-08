"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const _ = require("lodash");
const moment = require("moment");
let UtilService = class UtilService {
    addDays(days, date = new Date()) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    convertDaysToSchedule(days) {
        const convertedDays = [];
        if (Array.isArray(days)) {
            const today = moment().day();
            const thisWeek = days.filter(day => day > today);
            const nextWeek = days.filter(day => day < today);
            for (const day of thisWeek) {
                convertedDays.push(moment().day(day).format('DD/MM/YYYY'));
            }
            for (const day of nextWeek) {
                convertedDays.push(moment().day(day + 7).format('DD/MM/YYYY'));
            }
        }
        else {
            convertedDays.push(moment().day(days).format('DD/MM/YYYY'));
        }
        return this.removeUnecessaryDates(this.sortDates(convertedDays));
    }
    sortDates(dates) {
        return _.orderBy(dates, date => moment(date, 'DD/MM/YYYY').format('YYYYMMDD'), ['asc']);
    }
    removeUnecessaryDates(dates) {
        return dates.filter((dia) => {
            return moment(dia, 'DD/MM/YYYY')
                .isBefore(moment().add(5, 'days'));
        });
    }
};
UtilService = __decorate([
    common_1.Injectable()
], UtilService);
exports.UtilService = UtilService;
//# sourceMappingURL=util.service.js.map
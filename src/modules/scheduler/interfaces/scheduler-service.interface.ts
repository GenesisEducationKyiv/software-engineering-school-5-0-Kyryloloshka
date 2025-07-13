export interface ISchedulerService {
  processHourly(): Promise<void>;
  processDaily(): Promise<void>;
}

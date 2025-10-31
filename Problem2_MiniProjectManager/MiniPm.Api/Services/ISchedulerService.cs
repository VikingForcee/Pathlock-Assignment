using System;
using System.Collections.Generic;
using MiniPm.Api.Models;
using MiniPm.Api.DTOs;

namespace MiniPm.Api.Services
{
    public interface ISchedulerService
    {
        ScheduleResultDto GenerateSchedule(IEnumerable<TaskItem> tasks, SchedulerRequestDto request);
    }
}

using System;
using System.Collections.Generic;

namespace MiniPm.Api.DTOs
{
    public class SchedulerRequestDto
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public double DailyWorkHours { get; set; } = 2.0;
        public string Strategy { get; set; } = "dueDatePriority";
    }

    public class ScheduledTaskDto
    {
        public Guid TaskId { get; set; }
        public string Title { get; set; } = string.Empty;
        public double SuggestedHours { get; set; }
        public bool IsPartial { get; set; }
    }

    public class DayScheduleDto
    {
        public DateTime Date { get; set; }
        public List<ScheduledTaskDto> Tasks { get; set; } = new();
    }

    public class ScheduleResultDto
    {
        public Guid ProjectId { get; set; }
        public DateTime GeneratedAt { get; set; }
        public List<DayScheduleDto> Schedule { get; set; } = new();
        public List<Guid> OverdueRiskTasks { get; set; } = new();
    }
}

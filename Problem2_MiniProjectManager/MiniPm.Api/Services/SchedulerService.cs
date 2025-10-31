using System;
using System.Collections.Generic;
using System.Linq;
using MiniPm.Api.Models;
using MiniPm.Api.DTOs;

namespace MiniPm.Api.Services
{
    public class SchedulerService : ISchedulerService
    {
        private class TaskWork
        {
            public TaskItem Task { get; set; }
            public double Remaining { get; set; }
        }

        public ScheduleResultDto GenerateSchedule(IEnumerable<TaskItem> tasks, SchedulerRequestDto request)
        {
            var tasksList = tasks.Where(t => !t.IsCompleted).ToList();
            // Default estimated hours: 1 hour if not provided
            var taskInfos = tasksList
            .Where(t => !t.IsCompleted)
            .Select(t => new TaskWork { Task = t, Remaining = 1.0 })
            .ToList();

            DateTime start = request.StartDate?.Date ?? DateTime.UtcNow.Date;
            DateTime end = request.EndDate?.Date ?? start.AddDays(13); // 14-day window by default
            if (end < start) end = start;

            // Sort: earliest due date first (null due date last)
            taskInfos = taskInfos.OrderBy(t => t.Task.DueDate ?? DateTime.MaxValue)
                                 .ThenBy(t => t.Task.CreatedAt)
                                 .ToList();

            var schedule = new List<DayScheduleDto>();
            var overdueRisk = new List<Guid>();

            for (var day = start; day <= end; day = day.AddDays(1))
            {
                double remainingDayHours = request.DailyWorkHours;
                var daySchedule = new DayScheduleDto { Date = day };
                foreach (var ti in taskInfos.Where(x => x.Remaining > 0).ToList())
                {
                    if (remainingDayHours <= 0) break;
                    var assign = Math.Min(ti.Remaining, remainingDayHours);
                    daySchedule.Tasks.Add(new ScheduledTaskDto {
                        TaskId = ti.Task.Id,
                        Title = ti.Task.Title,
                        SuggestedHours = assign,
                        IsPartial = assign < ti.Remaining
                    });
                    ti.Remaining -= assign;
                    remainingDayHours -= assign;
                }
                if (daySchedule.Tasks.Count > 0) schedule.Add(daySchedule);
            }

            // identify tasks that remain unscheduled and whose due date falls before or on end
            foreach (var ti in taskInfos.Where(ti => ti.Remaining > 0))
            {
                if (ti.Task.DueDate.HasValue && ti.Task.DueDate.Value.Date <= end)
                    overdueRisk.Add(ti.Task.Id);
            }

            return new ScheduleResultDto {
                ProjectId = Guid.Empty, // caller can set project id
                GeneratedAt = DateTime.UtcNow,
                Schedule = schedule,
                OverdueRiskTasks = overdueRisk
            };
        }
    }
}

using System;

namespace Domain.Entities
{

    public class TasksPeriodEntity : BaseEntity
    {
        public TasksPeriodEntity()
        {
        }

        public TasksPeriodEntity(Guid PeriodStaffId, int TaskNumber, int TaskHours)
        {
            this.PeriodStaffId = PeriodStaffId;
            this.TaskNumber = TaskNumber;
            this.TaskHours = TaskHours;

        }

        public Guid PeriodStaffId { get; set; }
        public int TaskNumber { get; set; }
        public int TaskHours { get; set; }
        public virtual PeriodStaffEntity PeriodStaff { get; set; }
        public Guid ProjectId { get; set; }
        public virtual ProjectsEntity Project { get; set; }

    }
}
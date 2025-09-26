using System;
using System.Collections.Generic;

namespace Domain.Entities
{

    public class TasksEntity : BaseEntity
    {
        public TasksEntity()
        {
            Assignees = new List<string>();
            Dependencies = new List<string>();
        }



        public Guid? ProjectId { get; set; }
        public Guid? SprintId { get; set; }
        public Guid? ParentTaskId { get; set; }
        public Guid AssigneeId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Priority { get; set; }
        public string Status { get; set; }
        public decimal EstimatedHours { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Progress { get; set; }
        public List<string>? Assignees { get; set; }
        public List<string>? Dependencies { get; set; }
        public string? Color { get; set; }
        public string? Type { get; set; }
        public bool IsDisabled { get; set; }
        public bool HideChildren { get; set; }
        public DateTime? CompletedDate { get; set; }
        public string? Tags { get; set; }
        public string? Category { get; set; }
        public Guid? TeamId { get; set; }
        public virtual TeamEntity? Team { get; set; }

    }
}
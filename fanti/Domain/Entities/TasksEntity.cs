using System;
using System.Collections.Generic;
using Domain.Enum;

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
        public virtual ProjectsEntity? Project { get; set; }
        public Guid? SprintId { get; set; }
        public virtual SprintsEntity? Sprint { get; set; }
        public Guid? ParentTaskId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public Enum.TaskStatus Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal Progress { get; set; } = 0;
        public List<string>? Assignees { get; set; }
        public List<string>? Dependencies { get; set; }
        public string? Color { get; set; }
        public string Type { get; set; } = TaskType.Project.GetDisplayName();
        public bool IsDisabled { get; set; } = false;
        public bool HideChildren { get; set; } = false;
        public TaskCategory? Category { get; set; }
        public Guid? TeamId { get; set; }
        public virtual TeamEntity? Team { get; set; }

    }
}
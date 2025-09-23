using System;

namespace Domain.Entities
{
    
    public class SprintsEntity : BaseEntity 
    {
        public SprintsEntity() 
        {
        }
        
        public SprintsEntity(Guid ProjectId, string Name, string Description, string StartDate, string EndDate, string Goal, string Status)
        {
            this.ProjectId = ProjectId;
            this.Name = Name;
            this.Description = Description;
            this.StartDate = StartDate;
            this.EndDate = EndDate;
            this.Goal = Goal;
            this.Status = Status;

        }
        
        public Guid ProjectId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string StartDate { get; set; }
        public string EndDate { get; set; }
        public string Goal { get; set; }
        public string Status { get; set; }

    }
}
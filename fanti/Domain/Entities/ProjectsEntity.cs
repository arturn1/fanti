using System;
using Domain.Enum;

namespace Domain.Entities
{

    public class ProjectsEntity : BaseEntity
    {
        public ProjectsEntity()
        {
        }



        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectStatus Status { get; set; }
        public string? url { get; set; }

    }
}
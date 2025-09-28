using System;

namespace Domain.Entities
{

    public class ProjectVersionEntity : BaseEntity
    {
        public ProjectVersionEntity()
        {
        }

        public ProjectVersionEntity(Guid ProjectId, ProjectsEntity Project, string Version, DateTime DeployDate)
        {
            this.ProjectId = ProjectId;
            this.Project = Project;
            this.Version = Version;
            this.DeployDate = DeployDate;

        }

        public Guid ProjectId { get; set; }
        public virtual ProjectsEntity Project { get; set; }
        public string Version { get; set; }
        public DateTime DeployDate { get; set; }

    }
}
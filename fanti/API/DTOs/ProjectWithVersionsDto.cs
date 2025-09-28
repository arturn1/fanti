using System;
using System.Collections.Generic;
using Domain.Enum;

namespace API.DTOs
{
    public class ProjectWithVersionsDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public ProjectStatus? Status { get; set; }
        public string? url { get; set; }
        public List<ProjectVersionDto>? Versions { get; set; }
    }

    public class ProjectVersionDto
    {
        public Guid Id { get; set; }
        public string? Version { get; set; }
        public DateTime DeployDate { get; set; }
    }
}

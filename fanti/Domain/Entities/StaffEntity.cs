using System;

namespace Domain.Entities
{

    public class StaffEntity : BaseEntity
    {
        public StaffEntity()
        {
        }



        public string Name { get; set; }
        public Guid TeamId { get; set; }
        public virtual TeamEntity Team { get; set; }

    }
}
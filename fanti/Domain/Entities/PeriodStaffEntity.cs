using System;

namespace Domain.Entities
{

    public class PeriodStaffEntity : BaseEntity
    {
        public PeriodStaffEntity()
        {
        }



        public virtual StaffEntity Staff { get; set; }
        public Guid StaffId { get; set; }
        public Guid PeriodId { get; set; }
        public virtual PeriodEntity Period { get; set; }
        public int TotalHours { get; set; }
        public int TaskNumber { get; set; }

    }
}